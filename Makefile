.PHONY: install_frontend install_backend build_backend run_backend run_frontend run stop

install_frontend:
	cd frontend && npm install 

install_backend:
	cd backend && npm install 
install: install_frontend install_backend 

build_backend:
	cd backend && npx tsc 

run_backend:
	cd backend && node dist/server.js > backend_out.txt 2>&1 & 
run_frontend: 
	cd frontend && npm run dev > frontend_out.txt 2>&1 & 

run:  run_backend run_frontend
	@echo "Both services running"

stop:
	@pkill -f "node dist/server.js" || true
	@pkill -f "npm run dev" || true
	@echo "Services stopped"

build_frontend: 
	cd frontend && npm run build 

rsync_to_server:
	sudo rsync -av -e "ssh -p 22000" --delete \
		--rsync-path="sudo rsync" \
		--exclude='node_modules' \
		--exclude='*/node_modules' \
		--exclude='build' \
		--exclude ".git" \
		--max-size=10m \
		~/Github/course_explorer/ isaac@isaac-db.dylt.dev:/home/isaac/course_explorer
