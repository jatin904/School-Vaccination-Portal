/*Script to create school_user role:*/

-- Role: school_user
-- DROP ROLE IF EXISTS school_user;

CREATE ROLE school_user WITH
  LOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS
  ENCRYPTED PASSWORD 'SCRAM-SHA-256$4096:dambEdbk9fAVx+qAaXv+mw==$TvlFLLSkUA6+i/3bB7fLyryEE7wqdRKZnOoOUsOd3lY=:B9acSSH4fG47PxoTh5schwEhzyAGci4xmTO+dG+m3PI=';

  /*Script to create database*/
  -- Database: school_vaccine_db

-- DROP DATABASE IF EXISTS school_vaccine_db;

CREATE DATABASE school_vaccine_db
    WITH
    OWNER = school_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_India.1252'
    LC_CTYPE = 'English_India.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

/*Create table SequalizeMeta*/
-- Table: public.SequelizeMeta

-- DROP TABLE IF EXISTS public."SequelizeMeta";

CREATE TABLE IF NOT EXISTS public."SequelizeMeta"
(
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."SequelizeMeta"
    OWNER to school_user;

GRANT ALL ON TABLE public."SequelizeMeta" TO school_user;

/*student_vaccine_link*/
-- Table: public.student_vaccine_link

-- DROP TABLE IF EXISTS public.student_vaccine_link;

CREATE TABLE IF NOT EXISTS public.student_vaccine_link
(
    id integer NOT NULL DEFAULT nextval('student_vaccine_link_id_seq'::regclass),
    student_id integer,
    vaccination_drive_id integer,
    CONSTRAINT p_key PRIMARY KEY (id),
    CONSTRAINT std_f_key FOREIGN KEY (student_id)
        REFERENCES public.students (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT vaccine_d_f_key FOREIGN KEY (vaccination_drive_id)
        REFERENCES public.vaccination_drives (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.student_vaccine_link
    OWNER to school_user;

GRANT ALL ON TABLE public.student_vaccine_link TO school_user;

/*Create table students*/
-- Table: public.students

-- DROP TABLE IF EXISTS public.students;

CREATE TABLE IF NOT EXISTS public.students
(
    id integer NOT NULL DEFAULT nextval('students_id_seq'::regclass),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    vaccination_status character varying COLLATE pg_catalog."default" DEFAULT 'Not Vaccinated'::character varying,
    classname character varying COLLATE pg_catalog."default" NOT NULL,
    dob date NOT NULL,
    CONSTRAINT students_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.students
    OWNER to school_user;

GRANT ALL ON TABLE public.students TO school_user;

/*Create table vaccination_drives*/
-- Table: public.vaccination_drives

-- DROP TABLE IF EXISTS public.vaccination_drives;

CREATE TABLE IF NOT EXISTS public.vaccination_drives
(
    id integer NOT NULL DEFAULT nextval('vaccination_drives_id_seq'::regclass),
    title character varying(100) COLLATE pg_catalog."default" NOT NULL,
    drive_date date NOT NULL,
    vaccine_name character varying COLLATE pg_catalog."default" NOT NULL,
    no_of_vaccine integer NOT NULL,
    classname character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT vaccination_drives_pkey PRIMARY KEY (id),
    CONSTRAINT drive_date_ukey UNIQUE (drive_date)
        INCLUDE(drive_date)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.vaccination_drives
    OWNER to school_user;

GRANT ALL ON TABLE public.vaccination_drives TO school_user;

/*Create vaccination_drives_id_seq*/
-- SEQUENCE: public.vaccination_drives_id_seq

-- DROP SEQUENCE IF EXISTS public.vaccination_drives_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.vaccination_drives_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.vaccination_drives_id_seq
    OWNED BY public.vaccination_drives.id;

ALTER SEQUENCE public.vaccination_drives_id_seq
    OWNER TO school_user;

/*Create students_id_seq*/
-- SEQUENCE: public.students_id_seq

-- DROP SEQUENCE IF EXISTS public.students_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.students_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.students_id_seq
    OWNED BY public.students.id;

ALTER SEQUENCE public.students_id_seq
    OWNER TO school_user;

/*Create vaccination_drives_id_seq*/
-- SEQUENCE: public.vaccination_drives_id_seq

-- DROP SEQUENCE IF EXISTS public.vaccination_drives_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.vaccination_drives_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.vaccination_drives_id_seq
    OWNED BY public.vaccination_drives.id;

ALTER SEQUENCE public.vaccination_drives_id_seq
    OWNER TO school_user;
            