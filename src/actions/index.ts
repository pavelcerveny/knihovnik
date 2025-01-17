import Database from "@tauri-apps/plugin-sql";
import { DB_PATH } from "../constant";

export interface Author {
	id: number;
	name: string;
}

export interface Category {
	id: number;
	name: string;
}

export interface Location {
	id: number;
	name: string;
}

export interface Setting {
	id: number;
	name: string;
	value: string;
}

export interface Book {
	id: number;
	name: string;
	publish_year: number;
	number_of_pages: number;
	image_url: string;
	author: Author | null;
	category: Category | null;
	location: Location | null;
}

export async function fetchAuthors() {
	const db = await Database.load(DB_PATH);
	const authors =
		(await db.select<Author[]>("SELECT * FROM authors ORDER BY name")) ?? [];
	return { authors };
}

export async function fetchCategories() {
	const db = await Database.load(DB_PATH);
	const categories =
		(await db.select<Category[]>("SELECT * FROM categories ORDER BY name")) ??
		[];
	return { categories };
}

export async function fetchLocations() {
	const db = await Database.load(DB_PATH);
	const locations =
		(await db.select<Location[]>("SELECT * FROM locations ORDER BY name")) ??
		[];
	return { locations };
}

export async function fetchSettings() {
	const db = await Database.load(DB_PATH);
	const settings = (await db.select<Setting[]>("SELECT * FROM settings")) ?? [];
	return { settings };
}

export async function fetchBooks({
	searchValue,
}: { searchValue?: string }): Promise<{ books: Book[] }> {
	const db = await Database.load(DB_PATH);

	let where = "";

	if (searchValue) {
		where = `WHERE books.name LIKE '%${searchValue}%' OR authors.name LIKE '%${searchValue}%' OR categories.name LIKE '%${searchValue}%' OR locations.name LIKE '%${searchValue}%'`;
	}

	const books =
		(await db.select<Record<string, unknown>[]>(`
      SELECT books.*, 
      authors.id as authorId, authors.name as authorName, 
      categories.id as categoryId, categories.name as categoryName, 
      locations.id as locationId, locations.name as locationName
      FROM books 
      LEFT JOIN author_book ON books.id = author_book.book_id
      LEFT JOIN authors ON author_book.author_id = authors.id
      LEFT JOIN category_book ON books.id = category_book.book_id
      LEFT JOIN categories ON category_book.category_id = categories.id 
      LEFT JOIN locations ON books.location_id = locations.id
      ${where}
      ORDER BY books.name
      `)) ?? [];

	const hydratedBooks = books.map((book) => ({
		id: book.id,
		name: book.name,
		publish_year: book.publish_year,
		number_of_pages: book.number_of_pages,
		image_url: book.image_url,
		author: book.authorId ? { id: book.authorId, name: book.authorName } : null,
		category: book.categoryId
			? { id: book.categoryId, name: book.categoryName }
			: null,
		location: book.locationId
			? { id: book.locationId, name: book.locationName }
			: null,
	}));
	return { books: hydratedBooks as Book[] };
}

interface SaveBook {
	name: string;
	publish_year: number | null;
	number_of_pages: number | null;
	author: Author | (Partial<Author> & { name: string });
	category: Category | (Partial<Category> & { name: string | null });
	location: Location | (Partial<Location> & { name: string | null });
}

export async function saveBook(book: SaveBook) {
	const db = await Database.load(DB_PATH);

	let categoryId = null;
	let locationId = null;
	const authorId = book.author?.id
		? book.author?.id
		: (
				await db.execute("INSERT INTO authors (name) VALUES (?)", [
					book.author.name,
				])
			).lastInsertId;

	if (book.category.name) {
		categoryId = book.category?.id
			? book.category?.id
			: (
					await db.execute("INSERT INTO categories (name) VALUES (?)", [
						book.category.name,
					])
				).lastInsertId;
	}

	if (book.location.name) {
		locationId = book.location?.id
			? book.location?.id
			: (
					await db.execute("INSERT INTO locations (name) VALUES (?)", [
						book.location.name,
					])
				).lastInsertId;
	}

	await db.execute(
		"INSERT INTO books (name, publish_year, number_of_pages, author_id, category_id, location_id) VALUES (?, ?, ?, ?, ?, ?)",
		[
			book.name,
			book.publish_year,
			book.number_of_pages,
			authorId,
			categoryId,
			locationId,
		],
	);
}

export async function deleteBook(id: unknown) {
	const db = await Database.load(DB_PATH);
	await db.execute("DELETE FROM books WHERE id = ?", [id]);
}

export async function deleteAuthor(id: unknown) {
	const db = await Database.load(DB_PATH);
	await db.execute("DELETE FROM authors WHERE id = ?", [id]);
}

export async function replaceSetting(name: string, value: string) {
	const db = await Database.load(DB_PATH);
	await db.execute("REPLACE INTO settings (name, value) VALUES (?, ?)", [
		name,
		value,
	]);
}
