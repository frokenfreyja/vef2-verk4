CREATE TABLE todos (
  id serial primary key,
  title character varying(128) NOT NULL,
  due timestamp with time zone,
  position int default 0,
  completed boolean default false,
  created timestamp with time zone default current_timestamp,
  updated timestamp with time zone default current_timestamp
);
