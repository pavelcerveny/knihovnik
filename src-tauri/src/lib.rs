// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let migrations = vec![
        Migration {
            version: 1,
            description: "create_authors_table",
            sql: "CREATE TABLE IF NOT EXISTS authors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_categories_table",
            sql: "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_locations_table",
            sql: "CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create_books_table",
            sql: "CREATE TABLE IF NOT EXISTS books (  
                id INTEGER PRIMARY KEY AUTOINCREMENT,  
                name TEXT NOT NULL,  
                publish_year INTEGER NULL,
                number_of_pages INTEGER NULL,
                image_url TEXT NULL,
                location_id INTEGER NULL REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_author_book_table",
            sql: "CREATE TABLE IF NOT EXISTS author_book (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER NULL REFERENCES books(id) ON DELETE SET NULL ON UPDATE CASCADE,
                author_id INTEGER NULL REFERENCES authors(id) ON DELETE SET NULL ON UPDATE CASCADE
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "create_category_book_table",
            sql: "CREATE TABLE IF NOT EXISTS category_book (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER NULL REFERENCES books(id) ON DELETE SET NULL ON UPDATE CASCADE,
                category_id INTEGER NULL REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "create_settings_table",
            sql: "CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, value TEXT NOT NULL);",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:database.db", migrations)
                .build()
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
