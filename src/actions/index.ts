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
	authors: Author[];
	categories: Category[];
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

export async function fetchBook({ id }: { id: number }) {
	const { books } = await fetchBooks({ id });
	return { book: books?.[0] };
}

interface RawBook {
	id: number;
	name: string;
	publish_year: number;
	number_of_pages: number;
	image_url: string;
	authorId: number | null;
	authorName: string | null;
	categoryId: number | null;
	categoryName: string | null;
	locationId: number | null;
	locationName: string | null;
}

interface SaveBook {
	name: string;
	publish_year: number | null;
	number_of_pages: number | null;
	authors: Partial<Author>[];
	categories: Partial<Category>[];
	location: Location | (Partial<Location> & { name: string | null });
}

interface UpdateBook extends SaveBook {
	id: number;
}

function hydrateBooks(rawRows: RawBook[]): Book[] {
	const booksMap: Map<number, Book> = new Map();

	for (const row of rawRows) {
		const {
			id,
			authorId,
			authorName,
			categoryId,
			categoryName,
			locationId,
			locationName,
			...restBookProps
		} = row;

		if (!booksMap.has(id)) {
			booksMap.set(id, {
				id,
				authors: [],
				categories: [],
				location:
					locationId && locationName
						? { id: locationId, name: locationName }
						: null,
				...restBookProps,
			});
		}

		const book = booksMap.get(id)!;

		if (
			authorId &&
			authorName &&
			!book.authors.some((author) => author.id === authorId)
		) {
			book.authors.push({ id: authorId, name: authorName });
		}

		if (
			categoryId &&
			categoryName &&
			!book.categories.some((category) => category.id === categoryId)
		) {
			book.categories.push({ id: categoryId, name: categoryName });
		}
	}

	return Array.from(booksMap.values());
}

export async function fetchBooks({
	searchValue,
	id,
}: { searchValue?: string; id?: number }): Promise<{ books: Book[] }> {
	const db = await Database.load(DB_PATH);

	let where = "";

	if (searchValue) {
		where = `WHERE books.name LIKE '%${searchValue}%' OR authors.name LIKE '%${searchValue}%' OR categories.name LIKE '%${searchValue}%' OR locations.name LIKE '%${searchValue}%'`;
	}

	if (id) {
		where = `WHERE books.id = ${id}`;
	}

	const books =
		(await db.select<RawBook[]>(`
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

	return { books: hydrateBooks(books) };
}

async function insertNewAuthors({ authors }: { authors: SaveBook["authors"] }) {
	const db = await Database.load(DB_PATH);
	return Promise.all(
		authors.map(async (author) => {
			if (author.id) {
				return author.id;
			}
			return (
				await db.execute("INSERT INTO authors (name) VALUES (?)", [author.name])
			).lastInsertId;
		}),
	);
}

async function insertNewCategories({
	categories,
}: { categories: SaveBook["categories"] }) {
	const db = await Database.load(DB_PATH);
	return Promise.all(
		categories.map(async (category) => {
			if (category.id) {
				return category.id;
			}
			return (
				await db.execute("INSERT INTO categories (name) VALUES (?)", [
					category.name,
				])
			).lastInsertId;
		}),
	);
}

async function insertNewLocations({
	location,
}: { location: SaveBook["location"] }) {
	const db = await Database.load(DB_PATH);
	let locationId = null;

	if (location.name) {
		locationId = location?.id
			? location?.id
			: (
					await db.execute("INSERT INTO locations (name) VALUES (?)", [
						location.name,
					])
				).lastInsertId;
	}

	return locationId;
}

export async function saveBook(book: SaveBook) {
	const db = await Database.load(DB_PATH);

	const locationId = await insertNewLocations({ location: book.location });

	const authorIds = await insertNewAuthors({ authors: book.authors });

	const categoryIds = await insertNewCategories({
		categories: book.categories,
	});

	const bookId = (
		await db.execute(
			"INSERT INTO books (name, publish_year, number_of_pages, location_id) VALUES (?, ?, ?, ?)",
			[book.name, book.publish_year, book.number_of_pages, locationId],
		)
	).lastInsertId;

	await Promise.all(
		authorIds.map((authorId) =>
			db.execute("INSERT INTO author_book (author_id, book_id) VALUES (?, ?)", [
				authorId,
				bookId,
			]),
		),
	);

	await Promise.all(
		categoryIds.map((categoryId) =>
			db.execute(
				"INSERT INTO category_book (category_id, book_id) VALUES (?, ?)",
				[categoryId, bookId],
			),
		),
	);
}

export async function updateBook(book: UpdateBook) {
	const db = await Database.load(DB_PATH);

	const { id, location, authors, categories } = book;

	const locationId = await insertNewLocations({ location });

	const authorIds = await insertNewAuthors({ authors });

	const categoryIds = await insertNewCategories({ categories });

	await db.execute(
		"DELETE FROM author_book WHERE book_id = ? AND author_id NOT IN (?)",
		[id, authorIds],
	);

	await db.execute(
		"DELETE FROM category_book WHERE book_id = ? AND category_id NOT IN (?)",
		[id, categoryIds],
	);

	for (const author of authorIds) {
		await db.execute(
			"INSERT OR IGNORE INTO author_book (book_id, author_id) VALUES (?, ?)",
			[id, author],
		);
	}

	for (const category of categoryIds) {
		await db.execute(
			"INSERT OR IGNORE INTO category_book (book_id, category_id) VALUES (?, ?)",
			[id, category],
		);
	}

	await db.execute(
		`UPDATE books
	 SET name = ?, publish_year = ?, number_of_pages = ?, location_id = ?
	 WHERE id = ?`,
		[book.name, book.publish_year, book.number_of_pages, locationId, id],
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
