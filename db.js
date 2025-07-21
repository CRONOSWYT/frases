import Database from 'better-sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const db = new Database('./frases.db'); // este archivo estará localmente

export { db };
