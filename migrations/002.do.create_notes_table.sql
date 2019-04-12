CREATE TABLE notes (
    id text PRIMARY KEY,
    name TEXT NOT NULL,
    modified TIMESTAMP DEFAULT now() NOT null,
    folderId text not null REFERENCES folders(id) on delete cascade ,
	content TEXT
);