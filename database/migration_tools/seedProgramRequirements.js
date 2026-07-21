/*
Loads the scraped degree-program requirements and university core curriculum into Postgres.

This is a one-off ingestion step, run by hand whenever the scrape is refreshed — the API
only ever READS these tables. Create the tables first with
database/models/program_requirements.sql, then:

    NODE_PATH=backend/node_modules node database/migration_tools/seedProgramRequirements.js

NODE_PATH is required: `pg` and `dotenv` are installed only under backend/node_modules,
and node resolves modules from this script's directory upward (there is no node_modules at
the repo root).

Inputs (produced by degree_program_reqs/scrape_programs.py and scrape_core_curriculum.py):
    degree_program_reqs/program_requirements_clean.json
    degree_program_reqs/core_curriculum.json

Upserts are keyed on the primary key so re-running is idempotent.
*/

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const REQS_PATH = path.join(__dirname, '../../degree_program_reqs/program_requirements_clean.json');
const CORE_PATH = path.join(__dirname, '../../degree_program_reqs/core_curriculum.json');

// 'Bachelor of Science in Computer Science' -> 'bachelor-of-science-in-computer-science'
function slugify(name) {
    return String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`missing input file: ${filePath} (run the scrapers first)`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

async function seedPrograms(client, programs) {
    // A handful of catalog pages have no plan grid (department landing pages, or a minor
    // whose requirements are prose). Skip them rather than storing empty requirements.
    const usable = programs.filter(p => Array.isArray(p.requirements) && p.requirements.length > 0);
    const skipped = programs.length - usable.length;

    // desc_name is not guaranteed unique across colleges; last one wins on collision.
    const seen = new Map();
    for (const program of usable) {
        seen.set(slugify(program.desc_name), program);
    }

    let count = 0;
    for (const [programId, program] of seen) {
        await client.query(
            `INSERT INTO course_explorer.program_requirements
                 (program_id, desc_name, kind, url, requirements, footnotes, intro)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (program_id) DO UPDATE SET
                 desc_name    = EXCLUDED.desc_name,
                 kind         = EXCLUDED.kind,
                 url          = EXCLUDED.url,
                 requirements = EXCLUDED.requirements,
                 footnotes    = EXCLUDED.footnotes,
                 intro        = EXCLUDED.intro`,
            [
                programId,
                program.desc_name,
                program.kind === 'minor' ? 'minor' : 'major',
                program.url || null,
                JSON.stringify(program.requirements || []),
                JSON.stringify(program.footnotes || {}),
                JSON.stringify(program.intro || []),
            ]
        );
        count += 1;
    }

    console.log(`[programs] upserted ${count} (skipped ${skipped} with no requirements)`);
    return count;
}

async function seedCore(client, categories) {
    let count = 0;
    for (const category of categories) {
        if (!category.category || !Array.isArray(category.areas) || category.areas.length === 0) {
            console.log(`[core] skipping ${category.category || '(unnamed)'} — no areas`);
            continue;
        }
        await client.query(
            `INSERT INTO course_explorer.core_curriculum (category, name, url, data, footnotes)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (category) DO UPDATE SET
                 name      = EXCLUDED.name,
                 url       = EXCLUDED.url,
                 data      = EXCLUDED.data,
                 footnotes = EXCLUDED.footnotes`,
            [
                category.category,
                category.name || category.category,
                category.url || null,
                JSON.stringify(category.areas),
                JSON.stringify(category.footnotes || {}),
            ]
        );
        count += 1;
    }
    console.log(`[core] upserted ${count} categor${count === 1 ? 'y' : 'ies'}`);
    return count;
}

async function main() {
    if (!process.env.NEON_DB_URL) {
        throw new Error('NEON_DB_URL is not set (expected in backend/.env)');
    }

    const programs = readJson(REQS_PATH);
    const core = readJson(CORE_PATH);

    const pool = new Pool({
        connectionString: process.env.NEON_DB_URL,
        ssl: process.env.NEON_DB_URL.includes('neon.tech')
            ? { require: true, rejectUnauthorized: false }
            : false,
    });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await seedPrograms(client, programs);
        await seedCore(client, core);
        await client.query('COMMIT');
        console.log('[done] seed committed');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch((error) => {
    console.error('[error]', error.message);
    process.exit(1);
});
