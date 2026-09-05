import psycopg2

passwords = ["postgres", "password", "", "admin", " 24203@IIITU.ac.in", "24203@IIITU.ac.in"]
for p in passwords:
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="peblo_tv",
            user="postgres",
            password=p
        )
        print(f"SUCCESS with password: '{p}'")
        conn.close()
        break
    except Exception as e:
        print(f"Failed for '{p}': {e}")
