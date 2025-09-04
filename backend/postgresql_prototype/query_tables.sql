SELECT * FROM weather;

SELECT city, (temp_hi + temp_lo)/2 as temp_avg, date FROM weather;

SELECT * FROM weather
    WHERE city = 'San Francisco' AND prcp > 0.0;

SELECT * FROM weather
    ORDER BY city, temp_lo;

SELECT DISTINCT city
    FROM weather
    ORDER BY city;

SELECT DISTINCT name FROM cities;

SELECT * FROM weather JOIN cities ON city = name;
SELECT city, temp_lo, temp_hi, prcp, date, location
    FROM weather JOIN cities ON city = name;

SELECT weather.city, weather.temp_lo, weather.temp_hi,
       weather.prcp, weather.date, cities.location
    FROM weather JOIN cities ON weather.city = cities.name;

SELECT *
    FROM weather, cities
    WHERE city = name;

SELECT *
    FROM weather LEFT OUTER JOIN cities ON weather.city = cities.name;

SELECT *
    FROM weather RIGHT OUTER JOIN cities ON weather.city = cities.name;

SELECT * 
    FROM weather w JOIN cities c ON w.city = c.name;

SELECT max(temp_lo) FROM weather;

-- SELECT city FROM weather WHERE temp_lo = max(temp_lo);  -- doesnt work!

SELECT city FROM weather 
    WHERE temp_lo = (SELECT max(temp_lo) FROM weather);

SELECT city, count(*), max(temp_lo) 
    FROM weather 
    GROUP BY city
    HAVING max(temp_lo) < 40;

SELECT city, count(*), max(temp_lo)
    FROM weather
    WHERE city like 'S%'
    GROUP BY city;
    
SELECT city, count(*) FILTER(WHERE temp_lo < 45), max(temp_lo), min(temp_lo) --FILTER only applies to count, not to min, or else min couldnt be below 45
    FROM weather
    GROUP BY city;
