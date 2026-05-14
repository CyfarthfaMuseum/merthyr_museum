--
-- PostgreSQL database dump
--

\restrict lOxKdgHyOIe9RbLl59I20RdfKv8UaEqoaP3buimd5ZDN7dMwuUcuNkl3H6ltJsr

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: admin_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.admin_role AS ENUM (
    'super_admin',
    'admin',
    'editor'
);


--
-- Name: admin_user_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.admin_user_status AS ENUM (
    'invited',
    'active',
    'disabled'
);


--
-- Name: content_location_relationship; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.content_location_relationship AS ENUM (
    'primary',
    'related',
    'nearby'
);


--
-- Name: content_media_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.content_media_role AS ENUM (
    'hero_image',
    'gallery_image',
    'audio',
    'thumbnail',
    'qr_print',
    'document',
    'other'
);


--
-- Name: era_designation; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.era_designation AS ENUM (
    'BC',
    'AD'
);


--
-- Name: location_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.location_type AS ENUM (
    'landmark',
    'museum',
    'street',
    'building',
    'memorial',
    'natural_site',
    'other'
);


--
-- Name: related_content_relationship; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.related_content_relationship AS ENUM (
    'related',
    'inspired_by',
    'same_theme',
    'same_location',
    'same_period'
);


--
-- Name: tag_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tag_type AS ENUM (
    'theme',
    'subject',
    'person',
    'activity',
    'period',
    'location',
    'other'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
begin
    if not exists (
        select 1
        from pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: -
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.admin_users (
    id,
    email,
    role,
    status
  )
  values (
    new.id,
    new.email,
    'editor',
    'invited'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL AND ppt.tablename NOT LIKE '% %'),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  -- Count raw slot entries before apply_rls/subscription filter
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  -- Apply RLS and filter as before
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  -- Real rows with slot count attached
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  -- Sentinel row: always returned when no real rows exist so Elixir can
  -- always read slot_changes_count. Identified by wal IS NULL.
  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: admin_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    role public.admin_role DEFAULT 'editor'::public.admin_role NOT NULL,
    token text NOT NULL,
    invited_by uuid,
    expires_at timestamp with time zone NOT NULL,
    accepted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    role public.admin_role DEFAULT 'editor'::public.admin_role NOT NULL,
    status public.admin_user_status DEFAULT 'invited'::public.admin_user_status NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: artefact_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artefact_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: artefact_category_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artefact_category_translations (
    artefact_category_id uuid NOT NULL,
    language_code text NOT NULL,
    label text NOT NULL
);


--
-- Name: artefact_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artefact_translations (
    artefact_content_item_id uuid NOT NULL,
    language_code text NOT NULL,
    notes text
);


--
-- Name: artefacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artefacts (
    content_item_id uuid NOT NULL,
    maker text,
    origin_place text,
    date_created_label text,
    material text,
    dimensions text,
    collection_holder text,
    catalogue_reference text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    artefact_category_id uuid
);


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_user_id uuid,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    action text NOT NULL,
    changes jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: biographies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.biographies (
    content_item_id uuid NOT NULL,
    person_name text NOT NULL,
    birth_year integer,
    death_year integer,
    birth_place text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: biography_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.biography_translations (
    biography_content_item_id uuid NOT NULL,
    language_code text NOT NULL,
    occupation text,
    biography_text text
);


--
-- Name: book_theme_books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_theme_books (
    book_theme_id uuid NOT NULL,
    book_content_item_id uuid NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: book_theme_paintings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_theme_paintings (
    book_theme_id uuid NOT NULL,
    painting_content_item_id uuid NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: book_theme_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_theme_translations (
    book_theme_id uuid NOT NULL,
    language_code text NOT NULL,
    title text NOT NULL,
    summary text,
    body text
);


--
-- Name: book_themes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_themes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    content_status_id smallint NOT NULL,
    created_by uuid,
    updated_by uuid,
    published_by uuid,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: book_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_translations (
    book_content_item_id uuid NOT NULL,
    language_code text NOT NULL,
    author text,
    excerpt text
);


--
-- Name: books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.books (
    content_item_id uuid NOT NULL,
    publication_year integer,
    isbn text,
    publisher text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: content_item_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_item_translations (
    content_item_id uuid NOT NULL,
    language_code text NOT NULL,
    title text NOT NULL,
    summary text,
    body text,
    custom_period_label text,
    seo_title text,
    seo_description text
);


--
-- Name: content_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_type_id smallint NOT NULL,
    content_status_id smallint NOT NULL,
    slug text NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    start_date_year integer,
    start_date_month integer,
    start_date_day integer,
    start_date_era public.era_designation,
    end_date_year integer,
    end_date_month integer,
    end_date_day integer,
    end_date_era public.era_designation,
    historical_period_id uuid,
    historical_era_id uuid,
    created_by uuid,
    updated_by uuid,
    published_by uuid,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT content_items_end_date_day_check CHECK (((end_date_day >= 1) AND (end_date_day <= 31))),
    CONSTRAINT content_items_end_date_month_check CHECK (((end_date_month >= 1) AND (end_date_month <= 12))),
    CONSTRAINT content_items_start_date_day_check CHECK (((start_date_day >= 1) AND (start_date_day <= 31))),
    CONSTRAINT content_items_start_date_month_check CHECK (((start_date_month >= 1) AND (start_date_month <= 12)))
);


--
-- Name: content_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_locations (
    content_item_id uuid NOT NULL,
    location_id uuid NOT NULL,
    relationship_type public.content_location_relationship DEFAULT 'related'::public.content_location_relationship NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: content_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_item_id uuid NOT NULL,
    media_asset_id uuid NOT NULL,
    role public.content_media_role DEFAULT 'other'::public.content_media_role NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: content_status_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_status_translations (
    content_status_id smallint NOT NULL,
    language_code text NOT NULL,
    label text NOT NULL
);


--
-- Name: content_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_statuses (
    id smallint NOT NULL,
    code text NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: content_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_statuses_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_statuses_id_seq OWNED BY public.content_statuses.id;


--
-- Name: content_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_tags (
    content_item_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: content_type_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_type_translations (
    content_type_id smallint NOT NULL,
    language_code text NOT NULL,
    label text NOT NULL
);


--
-- Name: content_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_types (
    id smallint NOT NULL,
    code text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: content_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_types_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_types_id_seq OWNED BY public.content_types.id;


--
-- Name: historical_era_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historical_era_translations (
    historical_era_id uuid NOT NULL,
    language_code text NOT NULL,
    name text NOT NULL,
    summary text
);


--
-- Name: historical_eras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historical_eras (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: historical_period_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historical_period_translations (
    historical_period_id uuid NOT NULL,
    language_code text NOT NULL,
    name text NOT NULL,
    summary text
);


--
-- Name: historical_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historical_periods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    start_year integer,
    end_year integer,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.languages (
    code text NOT NULL,
    name text NOT NULL,
    native_name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: location_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.location_translations (
    location_id uuid NOT NULL,
    language_code text NOT NULL,
    title text NOT NULL,
    description text
);


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    region_id uuid,
    slug text NOT NULL,
    address_line_1 text,
    address_line_2 text,
    town text,
    postcode text,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL,
    location_type public.location_type DEFAULT 'other'::public.location_type NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: map_region_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.map_region_translations (
    map_region_id uuid NOT NULL,
    language_code text NOT NULL,
    name text NOT NULL,
    summary text
);


--
-- Name: map_regions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.map_regions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    map_shape_geojson jsonb,
    centroid_lat numeric(9,6),
    centroid_lng numeric(9,6),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: media_asset_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_asset_translations (
    media_asset_id uuid NOT NULL,
    language_code text NOT NULL,
    alt_text text,
    caption text
);


--
-- Name: media_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    storage_path text NOT NULL,
    file_name text NOT NULL,
    mime_type text NOT NULL,
    file_size_bytes bigint,
    width integer,
    height integer,
    duration_seconds integer,
    credit text,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: painting_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.painting_translations (
    painting_content_item_id uuid NOT NULL,
    language_code text NOT NULL,
    detail_notes text
);


--
-- Name: paintings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paintings (
    content_item_id uuid NOT NULL,
    artist_name text,
    year_created integer,
    medium text,
    dimensions text,
    current_collection text,
    image_credit text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: qr_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qr_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_item_id uuid NOT NULL,
    target_url text NOT NULL,
    image_media_asset_id uuid,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    generated_by uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: related_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.related_content (
    parent_content_item_id uuid NOT NULL,
    child_content_item_id uuid NOT NULL,
    relationship_type public.related_content_relationship DEFAULT 'related'::public.related_content_relationship NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT related_content_not_self CHECK ((parent_content_item_id <> child_content_item_id))
);


--
-- Name: stories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stories (
    content_item_id uuid NOT NULL,
    story_type_id smallint NOT NULL,
    related_person_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: story_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_translations (
    story_content_item_id uuid NOT NULL,
    language_code text NOT NULL,
    event_details text
);


--
-- Name: story_type_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_type_translations (
    story_type_id smallint NOT NULL,
    language_code text NOT NULL,
    label text NOT NULL
);


--
-- Name: story_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_types (
    id smallint NOT NULL,
    code text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: story_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.story_types_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: story_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.story_types_id_seq OWNED BY public.story_types.id;


--
-- Name: tag_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag_translations (
    tag_id uuid NOT NULL,
    language_code text NOT NULL,
    name text NOT NULL
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    tag_type public.tag_type DEFAULT 'other'::public.tag_type NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: content_statuses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_statuses ALTER COLUMN id SET DEFAULT nextval('public.content_statuses_id_seq'::regclass);


--
-- Name: content_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_types ALTER COLUMN id SET DEFAULT nextval('public.content_types_id_seq'::regclass);


--
-- Name: story_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_types ALTER COLUMN id SET DEFAULT nextval('public.story_types_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
afa9c22b-3fec-4766-8f8f-e4f9841ecac5	03c6264c-c99e-43ee-a85a-964444653e4e	0cebbabe-3ef9-4bd0-ba5a-98a44df5b201	s256	2iBWskeccOMa2dBrW6sof7d_BLFzVPM0r_oq9cbtf9M	recovery			2026-05-07 11:12:53.80857+00	2026-05-07 11:13:24.039556+00	recovery	2026-05-07 11:13:24.039505+00	\N	\N	\N	\N	f
dbdd27c8-d5ef-48b5-a2a5-c6f028dc5ec7	03c6264c-c99e-43ee-a85a-964444653e4e	3f08a285-e537-43d2-8ff6-4ce374ccd098	s256	_MG7OmR6bPezQLISUTh7xEUgbLFkR30DO_DNjzJCsAk	recovery			2026-05-07 11:18:00.270142+00	2026-05-07 11:18:00.270142+00	recovery	\N	\N	\N	\N	\N	f
cd292da6-3b1a-4ded-bc83-f130c945cfc5	d4d9ff6b-65d2-4c26-b572-a9be2a058f8f	93e818a3-dfd3-47df-891e-c06f119f6448	s256	vXMpwrx2dojDbL-vZFEbcmwxG4UaYEzSjctHDYr8n0Q	recovery			2026-05-07 12:04:21.841056+00	2026-05-07 12:04:21.841056+00	recovery	\N	\N	\N	\N	\N	f
3cc9d316-87f5-432e-aed3-9e711cbd44f3	03c6264c-c99e-43ee-a85a-964444653e4e	aea4a63c-fb44-408c-b829-dc9fcda76849	s256	ckgA0YOfbOZGBf6TwycLihHL4OE_6ckw4lMKdpjIME4	recovery			2026-05-08 10:39:09.41344+00	2026-05-08 10:39:09.41344+00	recovery	\N	\N	\N	\N	\N	f
273c3abf-57c0-48e8-97c4-be7654572da9	eb1c1908-8c6b-4a4f-8010-f76dc87e0a36	3283d3b1-a1bc-410a-b970-26d56815b108	s256	NEWpV6M3_QKqYZaog5wiXuCRTce4_s7KHxo3KBeyPYg	recovery			2026-05-08 11:58:23.143841+00	2026-05-08 11:58:23.143841+00	recovery	\N	\N	\N	\N	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
8a8be28e-aeaf-4a6a-b425-417a7582002f	2026-05-14 13:46:30.189421+00	2026-05-14 13:46:30.189421+00	password	b09fff50-3805-4119-84b2-686d5fdd537d
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	120	3hl23bbojsfy	03c6264c-c99e-43ee-a85a-964444653e4e	f	2026-05-14 13:46:30.186322+00	2026-05-14 13:46:30.186322+00	\N	8a8be28e-aeaf-4a6a-b425-417a7582002f
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
8a8be28e-aeaf-4a6a-b425-417a7582002f	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-14 13:46:30.181707+00	2026-05-14 13:46:30.181707+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	83.104.164.113	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	09f55ebb-74b2-4866-92ad-546f49bf069f	authenticated	authenticated	wildebeeststudios@gmail.com	$2a$10$ZbkLUhVbYy4sneKhvvorSusYSxuac.78PpdB3PJ1/SI9.37S47uv2	2026-05-08 11:55:51.672758+00	2026-05-08 11:55:35.616083+00		\N		\N			\N	2026-05-08 11:55:51.676083+00	{"provider": "email", "providers": ["email"]}	{"role": "admin", "email_verified": true}	\N	2026-05-08 11:55:35.610821+00	2026-05-08 13:36:00.490828+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	eb1c1908-8c6b-4a4f-8010-f76dc87e0a36	authenticated	authenticated	gareth.lloyd3@southwales.ac.uk	$2a$10$20PQdtOkwqJU2iq0tBahwOGQFCrY8P5fXH95EtrgGw9DCDrI3.DYi	2026-05-08 11:54:40.846155+00	2026-05-08 11:54:17.363125+00		\N		\N			\N	2026-05-08 11:54:40.850496+00	{"provider": "email", "providers": ["email"]}	{"role": "admin", "email_verified": true}	\N	2026-05-08 11:54:17.326608+00	2026-05-08 11:54:40.853732+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	03c6264c-c99e-43ee-a85a-964444653e4e	authenticated	authenticated	william.warren@southwales.ac.uk	$2a$10$1O9im6otGSoqF9zBELSbKujkq9UyGmMrn/7u1kdJwJEY5SJg6eLsm	2026-04-20 15:53:30.028438+00	\N		\N	pkce_5cbc55aedd0847859bb324e2f4c951f1491e9ae2b19ac2810f6d8263	2026-05-08 10:39:09.428629+00			\N	2026-05-14 13:46:30.180408+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-04-20 15:53:30.018359+00	2026-05-14 13:46:30.188517+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: admin_invitations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_invitations (id, email, role, token, invited_by, expires_at, accepted_at, created_at) FROM stdin;
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, email, first_name, last_name, role, status, last_login_at, created_at, updated_at) FROM stdin;
03c6264c-c99e-43ee-a85a-964444653e4e	william.warren@southwales.ac.uk	Will	Warren	super_admin	active	\N	2026-04-20 15:53:30.017986+00	2026-04-27 10:40:10.844162+00
eb1c1908-8c6b-4a4f-8010-f76dc87e0a36	gareth.lloyd3@southwales.ac.uk	\N	\N	admin	invited	\N	2026-05-08 11:54:17.325707+00	2026-05-08 11:54:17.959943+00
09f55ebb-74b2-4866-92ad-546f49bf069f	wildebeeststudios@gmail.com	\N	\N	admin	invited	\N	2026-05-08 11:55:35.610529+00	2026-05-08 11:55:36.071151+00
\.


--
-- Data for Name: artefact_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artefact_categories (id, code, sort_order, created_at, updated_at) FROM stdin;
5e90ecf0-0234-4b54-8b7a-aeae9b543cb1	antique_ceramics	0	2026-05-06 15:23:34.589817+00	2026-05-06 15:23:34.589817+00
5dffbe53-e803-42f8-ac48-38f740e4e9c8	basic_ceramics	0	2026-05-06 15:23:44.858085+00	2026-05-06 15:23:44.858085+00
\.


--
-- Data for Name: artefact_category_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artefact_category_translations (artefact_category_id, language_code, label) FROM stdin;
5e90ecf0-0234-4b54-8b7a-aeae9b543cb1	en	Antique Ceramics
5dffbe53-e803-42f8-ac48-38f740e4e9c8	en	Basic Ceramics
\.


--
-- Data for Name: artefact_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artefact_translations (artefact_content_item_id, language_code, notes) FROM stdin;
462ac96f-db26-4431-b36c-ec263a03e045	en	\N
\.


--
-- Data for Name: artefacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artefacts (content_item_id, maker, origin_place, date_created_label, material, dimensions, collection_holder, catalogue_reference, created_at, updated_at, artefact_category_id) FROM stdin;
462ac96f-db26-4431-b36c-ec263a03e045	\N	\N	\N	\N	\N	\N	\N	2026-05-06 15:12:01.975314+00	2026-05-07 15:53:53.14876+00	5e90ecf0-0234-4b54-8b7a-aeae9b543cb1
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_log (id, admin_user_id, entity_type, entity_id, action, changes, created_at) FROM stdin;
\.


--
-- Data for Name: biographies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.biographies (content_item_id, person_name, birth_year, death_year, birth_place, created_at, updated_at) FROM stdin;
90531f7c-3baa-4a7b-bb7c-b56161d8d49e	Test Another	\N	\N	\N	2026-05-06 13:41:01.51965+00	2026-05-06 13:41:01.51965+00
4159315b-85f5-46fc-aaad-51dc257d8088	Bob Builder	\N	\N	\N	2026-05-06 13:37:01.945027+00	2026-05-06 15:30:05.206213+00
\.


--
-- Data for Name: biography_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.biography_translations (biography_content_item_id, language_code, occupation, biography_text) FROM stdin;
90531f7c-3baa-4a7b-bb7c-b56161d8d49e	en	\N	\N
4159315b-85f5-46fc-aaad-51dc257d8088	en	\N	\N
\.


--
-- Data for Name: book_theme_books; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.book_theme_books (book_theme_id, book_content_item_id, sort_order, created_at) FROM stdin;
baee6dda-d71b-4b40-8d7e-031b497438dd	62d49877-9f05-4f27-917c-3c61719bd62a	0	2026-04-27 12:06:02.532672+00
b06131c2-dc25-4821-94c6-a9f50b0e6110	7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	0	2026-05-01 07:56:36.476396+00
cb708898-78c7-43fc-a4d3-d62a3a6aa763	7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	0	2026-05-01 09:38:29.097204+00
b06131c2-dc25-4821-94c6-a9f50b0e6110	8eef3ae7-a499-4c1b-8974-2f386801b5b4	0	2026-05-07 10:42:10.812037+00
b06131c2-dc25-4821-94c6-a9f50b0e6110	1db43cd4-ed38-4169-8c53-4e21a029bc22	0	2026-05-07 10:43:00.265755+00
b06131c2-dc25-4821-94c6-a9f50b0e6110	8dd96574-0be3-44fd-9bf7-6b0b5c6713d7	0	2026-05-07 10:43:20.555957+00
\.


--
-- Data for Name: book_theme_paintings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.book_theme_paintings (book_theme_id, painting_content_item_id, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: book_theme_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.book_theme_translations (book_theme_id, language_code, title, summary, body) FROM stdin;
baee6dda-d71b-4b40-8d7e-031b497438dd	en	Fiction	\N	\N
b06131c2-dc25-4821-94c6-a9f50b0e6110	en	Historical Fiction	\N	\N
6ba9a6f9-9b07-430c-9289-b3a34a26473e	en	Test	\N	\N
cb708898-78c7-43fc-a4d3-d62a3a6aa763	en	Another test	\N	\N
d9cd7894-5c83-422e-a61a-1bb5b4d968f3	en	Friday Test	\N	\N
\.


--
-- Data for Name: book_themes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.book_themes (id, slug, content_status_id, created_by, updated_by, published_by, published_at, created_at, updated_at) FROM stdin;
baee6dda-d71b-4b40-8d7e-031b497438dd	fiction	1	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-04-21 13:58:24.589826+00	2026-04-21 13:58:24.589826+00
b06131c2-dc25-4821-94c6-a9f50b0e6110	historical-fiction	1	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-04-24 07:48:04.816621+00	2026-04-24 07:48:04.816621+00
6ba9a6f9-9b07-430c-9289-b3a34a26473e	test	1	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-04-27 12:33:12.456954+00	2026-04-27 12:33:12.456954+00
cb708898-78c7-43fc-a4d3-d62a3a6aa763	another-test	1	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-01 09:38:24.134241+00	2026-05-01 09:38:24.134241+00
d9cd7894-5c83-422e-a61a-1bb5b4d968f3	friday-test	1	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-01 10:29:23.95708+00	2026-05-01 10:29:23.95708+00
\.


--
-- Data for Name: book_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.book_translations (book_content_item_id, language_code, author, excerpt) FROM stdin;
62d49877-9f05-4f27-917c-3c61719bd62a	en	ewr	ewr
cf91c0c5-0d03-413e-8e2d-5f94f5aaeb54	en	sd	sd
1db43cd4-ed38-4169-8c53-4e21a029bc22	en	\N	A collection of eleven medieval Welsh tales, transcribed in the 14th-century White Book of Rhydderch and Red Book of Hergest. The stories originate from a long oral tradition, likely embellished by Welsh storytellers, with some scholars proposing medieval figures like Princess Gwenllian influenced the texts.
8dd96574-0be3-44fd-9bf7-6b0b5c6713d7	en	\N	A collection of eleven medieval Welsh tales, transcribed in the 14th-century White Book of Rhydderch and Red Book of Hergest. The stories originate from a long oral tradition, likely embellished by Welsh storytellers, with some scholars proposing medieval figures like Princess Gwenllian influenced the texts.
7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	en	\N	df
8eef3ae7-a499-4c1b-8974-2f386801b5b4	en	\N	A collection of eleven medieval Welsh tales, transcribed in the 14th-century White Book of Rhydderch and Red Book of Hergest. The stories originate from a long oral tradition, likely embellished by Welsh storytellers, with some scholars proposing medieval figures like Princess Gwenllian influenced the texts.
8eef3ae7-a499-4c1b-8974-2f386801b5b4	cy	\N	\N
b233f39d-1d06-4282-909c-9dc43fc687b4	en	A N Author	Some summary
\.


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.books (content_item_id, publication_year, isbn, publisher, created_at, updated_at) FROM stdin;
62d49877-9f05-4f27-917c-3c61719bd62a	2026	\N	ds	2026-04-24 14:45:10.672716+00	2026-05-06 12:54:55.956907+00
cf91c0c5-0d03-413e-8e2d-5f94f5aaeb54	2026	\N	ds	2026-04-24 14:47:04.582225+00	2026-05-06 14:30:15.313075+00
1db43cd4-ed38-4169-8c53-4e21a029bc22	\N	\N	\N	2026-05-07 10:42:59.678409+00	2026-05-07 10:42:59.678409+00
8dd96574-0be3-44fd-9bf7-6b0b5c6713d7	\N	\N	\N	2026-05-07 10:43:19.973589+00	2026-05-07 10:43:19.973589+00
7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	\N	\N	\N	2026-04-27 12:16:15.92211+00	2026-05-07 16:07:50.932372+00
8eef3ae7-a499-4c1b-8974-2f386801b5b4	\N	\N	\N	2026-05-07 10:42:09.888497+00	2026-05-08 08:29:26.985125+00
b233f39d-1d06-4282-909c-9dc43fc687b4	\N	\N	\N	2026-05-01 07:54:37.695077+00	2026-05-01 07:56:16.093328+00
\.


--
-- Data for Name: content_item_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_item_translations (content_item_id, language_code, title, summary, body, custom_period_label, seo_title, seo_description) FROM stdin;
62d49877-9f05-4f27-917c-3c61719bd62a	en	Fiction Book	ewr	wer	\N	test	ewr
1c8707cd-41f9-4c37-a9af-fa45de6896ff	en	Test	summary	\N	\N	Test	summary
c61ee4aa-d9cd-409e-b28b-8dfeaa1c846d	en	Test 1	Test summary	\N	\N	Test 1	Test summary
26c2c763-0389-48cb-80fe-939d293a91b8	en	Test 2	Test 2 summary	\N	\N	Test 2	Test 2 summary
9ceae33d-d843-461e-81bf-df1360c9915a	en	Story 1	Story summary	\N	\N	Story 1	Story summary
6945c3cc-5817-4ba2-9d5e-f39ca1d69428	en	Vignette	Vignette summary	\N	\N	Vignette	Vignette summary
9c0a4769-0ffd-4e4f-bb31-d4e48f37359f	en	Vignette 2	Vignette 2	\N	\N	Vignette 2	Vignette 2
eb575f8b-5efb-49bf-bf21-a0f28a30c230	en	Painting	\N	\N	\N	Painting	\N
90531f7c-3baa-4a7b-bb7c-b56161d8d49e	en	Test Another	\N	\N	\N	Test Another	\N
cf91c0c5-0d03-413e-8e2d-5f94f5aaeb54	en	Uncategorised Book	sd	sd	\N	ds	sd
4159315b-85f5-46fc-aaad-51dc257d8088	en	Bob Builder	Dude	\N	\N	Bob Builder	Dude
b233f39d-1d06-4282-909c-9dc43fc687b4	en	Alphabetical Uncategorised Book	Some summary	\N	\N	Test book	Some summary
1db43cd4-ed38-4169-8c53-4e21a029bc22	en	The Mabinogion	A collection of eleven medieval Welsh tales, transcribed in the 14th-century White Book of Rhydderch and Red Book of Hergest. The stories originate from a long oral tradition, likely embellished by Welsh storytellers, with some scholars proposing medieval figures like Princess Gwenllian influenced the texts.	The collection is made up of 11 tales, which weave together folklore, Celtic history and tradition and are set in a strange and magic-filled land which resembles Wales. They mostly focus on different Welsh royal families whose members signify various Gallo-Brittonic mythological gods.\n\nThe Mabinogion is essentially based on some of the first written forms of the tales. Written in the 14th century, and known as the White Book of Rhydderch (1300-1325) and the Red Book of Hergest (1375-1425), the stories themselves go back much further. For years, and down through generations, the stories were shared via word of mouth, thanks to storytellers who would move about from place to place exchanging tales for food or board. These stories evolved and developed through the Celtic and Welsh people who embellished them with each new telling.\n\n\nCharacter Peredur with a severed head from the 1902 edition of The Mabinogion\n\nThe stories were little known outside of Wales until the 19th century, when an English aristocrat called Lady Charlotte Guest published her translation under the title The Mabinogion. Lady Charlotte was passionate about supporting Wales and its culture and also helped to preserve certain traditions such as the Eisteddfod (a festival of music and poetry).\n\nThe name The Mabinogion however was a bit of a mistake on part of Lady Charlotte; she erroneously thought ‘mabinogion’ was the plural of ‘mabinogi’, a word which appears at the end of the line ‘Ac y uelly teruyna y geing hon yma Mabinogi,’ or ‘and thus ends this branch of the Mabinogi’. ‘Mabinogi’ comes from the word ‘mab’, which roughly translates as a ‘tale’ .\n\n\nRhiannon riding in Arberth\n\nThe original mabinogi tales, from which The Mabiniogion takes its name, were in four parts or ‘branches’:  Pwyll, Branwen, Manawydan and Math. These are all connected by a character who goes by the name of Pryderi. In Pwyll, Prince of Dyfed takes the place of the King of the Underworld after undergoing magical trials; Branwen talks about the 150 districts of Britain avenging the king’s sister Branwen; Manawydan features an enchanter who imprisons Pryderi; and Math includes a battle and Lord of Gwynedd who ends up turning his nephews into beasts.\n\nThe Mabinogion as a collection also refers to seven other stories: The Dream of Macsen Wledig; Llud and Llefelys; Culhwch and Olwen; The Dream of Rhonabwy; and three Arthurian adventures called The Lady of the Fountain, Peredur and Geraint and Enid. A 12th story, Taliesin, is also occasionally put in.	\N	The Mabinogion	A collection of eleven medieval Welsh tales, transcribed in the 14th-century White Book of Rhydderch and Red Book of Hergest. The stories originate from a long oral tradition, likely embellished by Welsh storytellers, with some scholars proposing medieval figures like Princess Gwenllian influenced the texts.
8dd96574-0be3-44fd-9bf7-6b0b5c6713d7	en	The Mabinogion	A collection of eleven medieval Welsh tales, transcribed in the 14th-century White Book of Rhydderch and Red Book of Hergest. The stories originate from a long oral tradition, likely embellished by Welsh storytellers, with some scholars proposing medieval figures like Princess Gwenllian influenced the texts.	The collection is made up of 11 tales, which weave together folklore, Celtic history and tradition and are set in a strange and magic-filled land which resembles Wales. They mostly focus on different Welsh royal families whose members signify various Gallo-Brittonic mythological gods.\n\nThe Mabinogion is essentially based on some of the first written forms of the tales. Written in the 14th century, and known as the White Book of Rhydderch (1300-1325) and the Red Book of Hergest (1375-1425), the stories themselves go back much further. For years, and down through generations, the stories were shared via word of mouth, thanks to storytellers who would move about from place to place exchanging tales for food or board. These stories evolved and developed through the Celtic and Welsh people who embellished them with each new telling.\n\n\nCharacter Peredur with a severed head from the 1902 edition of The Mabinogion\n\nThe stories were little known outside of Wales until the 19th century, when an English aristocrat called Lady Charlotte Guest published her translation under the title The Mabinogion. Lady Charlotte was passionate about supporting Wales and its culture and also helped to preserve certain traditions such as the Eisteddfod (a festival of music and poetry).\n\nThe name The Mabinogion however was a bit of a mistake on part of Lady Charlotte; she erroneously thought ‘mabinogion’ was the plural of ‘mabinogi’, a word which appears at the end of the line ‘Ac y uelly teruyna y geing hon yma Mabinogi,’ or ‘and thus ends this branch of the Mabinogi’. ‘Mabinogi’ comes from the word ‘mab’, which roughly translates as a ‘tale’ .\n\n\nRhiannon riding in Arberth\n\nThe original mabinogi tales, from which The Mabiniogion takes its name, were in four parts or ‘branches’:  Pwyll, Branwen, Manawydan and Math. These are all connected by a character who goes by the name of Pryderi. In Pwyll, Prince of Dyfed takes the place of the King of the Underworld after undergoing magical trials; Branwen talks about the 150 districts of Britain avenging the king’s sister Branwen; Manawydan features an enchanter who imprisons Pryderi; and Math includes a battle and Lord of Gwynedd who ends up turning his nephews into beasts.\n\nThe Mabinogion as a collection also refers to seven other stories: The Dream of Macsen Wledig; Llud and Llefelys; Culhwch and Olwen; The Dream of Rhonabwy; and three Arthurian adventures called The Lady of the Fountain, Peredur and Geraint and Enid. A 12th story, Taliesin, is also occasionally put in.	\N	The Mabinogion	A collection of eleven medieval Welsh tales, transcribed in the 14th-century White Book of Rhydderch and Red Book of Hergest. The stories originate from a long oral tradition, likely embellished by Welsh storytellers, with some scholars proposing medieval figures like Princess Gwenllian influenced the texts.
57f29275-2f18-42ec-bdd5-6d9ebb63d181	en	title	summary	content	\N	title	summary
7dcf837d-00d6-47b9-88f1-9094d842a192	en	title	summary	content	\N	title	summary
462ac96f-db26-4431-b36c-ec263a03e045	en	Artifact 1	\N	\N	\N	Artifact 1	\N
7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	en	Historical Fiction Book	df	sdf	\N	action	df
8eef3ae7-a499-4c1b-8974-2f386801b5b4	en	The Mabinogion	A collection of eleven medieval Welsh tales, transcribed in the 14th-century White Book of Rhydderch and Red Book of Hergest. The stories originate from a long oral tradition, likely embellished by Welsh storytellers, with some scholars proposing medieval figures like Princess Gwenllian influenced the texts.	The collection is made up of 11 tales, which weave together folklore, Celtic history and tradition and are set in a strange and magic-filled land which resembles Wales. They mostly focus on different Welsh royal families whose members signify various Gallo-Brittonic mythological gods.\n\nThe Mabinogion is essentially based on some of the first written forms of the tales. Written in the 14th century, and known as the White Book of Rhydderch (1300-1325) and the Red Book of Hergest (1375-1425), the stories themselves go back much further. For years, and down through generations, the stories were shared via word of mouth, thanks to storytellers who would move about from place to place exchanging tales for food or board. These stories evolved and developed through the Celtic and Welsh people who embellished them with each new telling.\n\n\nCharacter Peredur with a severed head from the 1902 edition of The Mabinogion\n\nThe stories were little known outside of Wales until the 19th century, when an English aristocrat called Lady Charlotte Guest published her translation under the title The Mabinogion. Lady Charlotte was passionate about supporting Wales and its culture and also helped to preserve certain traditions such as the Eisteddfod (a festival of music and poetry).\n\nThe name The Mabinogion however was a bit of a mistake on part of Lady Charlotte; she erroneously thought ‘mabinogion’ was the plural of ‘mabinogi’, a word which appears at the end of the line ‘Ac y uelly teruyna y geing hon yma Mabinogi,’ or ‘and thus ends this branch of the Mabinogi’. ‘Mabinogi’ comes from the word ‘mab’, which roughly translates as a ‘tale’ .\n\n\nRhiannon riding in Arberth\n\nThe original mabinogi tales, from which The Mabiniogion takes its name, were in four parts or ‘branches’:  Pwyll, Branwen, Manawydan and Math. These are all connected by a character who goes by the name of Pryderi. In Pwyll, Prince of Dyfed takes the place of the King of the Underworld after undergoing magical trials; Branwen talks about the 150 districts of Britain avenging the king’s sister Branwen; Manawydan features an enchanter who imprisons Pryderi; and Math includes a battle and Lord of Gwynedd who ends up turning his nephews into beasts.\n\nThe Mabinogion as a collection also refers to seven other stories: The Dream of Macsen Wledig; Llud and Llefelys; Culhwch and Olwen; The Dream of Rhonabwy; and three Arthurian adventures called The Lady of the Fountain, Peredur and Geraint and Enid. A 12th story, Taliesin, is also occasionally put in.	\N	The Mabinogion	A collection of eleven medieval Welsh tales, transcribed in the 14th-century White Book of Rhydderch and Red Book of Hergest. The stories originate from a long oral tradition, likely embellished by Welsh storytellers, with some scholars proposing medieval figures like Princess Gwenllian influenced the texts.
8eef3ae7-a499-4c1b-8974-2f386801b5b4	cy	Y Mabanogion	\N	\N	\N	Y Mabanogion	\N
\.


--
-- Data for Name: content_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_items (id, content_type_id, content_status_id, slug, featured, start_date_year, start_date_month, start_date_day, start_date_era, end_date_year, end_date_month, end_date_day, end_date_era, historical_period_id, historical_era_id, created_by, updated_by, published_by, published_at, created_at, updated_at) FROM stdin;
62d49877-9f05-4f27-917c-3c61719bd62a	1	1	ds-sd	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-04-24 14:45:10.618753+00	2026-05-06 12:54:55.894616+00
1c8707cd-41f9-4c37-a9af-fa45de6896ff	2	1	test-3	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-06 13:03:17.587488+00	2026-05-06 13:03:17.587488+00
c61ee4aa-d9cd-409e-b28b-8dfeaa1c846d	2	1	test	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-06 12:57:10.879727+00	2026-05-06 13:04:58.440399+00
26c2c763-0389-48cb-80fe-939d293a91b8	2	1	test-2	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-06 12:58:00.190554+00	2026-05-06 13:05:13.896787+00
9ceae33d-d843-461e-81bf-df1360c9915a	2	1	test-myth	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-01 07:57:45.518325+00	2026-05-06 13:17:36.223088+00
6945c3cc-5817-4ba2-9d5e-f39ca1d69428	2	1	test-myth-2	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-01 07:58:26.38976+00	2026-05-06 13:18:00.226033+00
9c0a4769-0ffd-4e4f-bb31-d4e48f37359f	2	1	test-myth-3	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-01 07:58:34.200484+00	2026-05-06 13:18:17.238748+00
eb575f8b-5efb-49bf-bf21-a0f28a30c230	3	1	painting	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-06 13:21:11.554805+00	2026-05-06 13:30:52.4723+00
90531f7c-3baa-4a7b-bb7c-b56161d8d49e	5	1	test-another	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-06 13:41:01.457828+00	2026-05-06 13:41:01.457828+00
cf91c0c5-0d03-413e-8e2d-5f94f5aaeb54	1	1	ds-sd-2	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-04-24 14:47:04.532721+00	2026-05-06 14:30:15.252447+00
b233f39d-1d06-4282-909c-9dc43fc687b4	1	1	test-q	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-04-24 14:41:51.168946+00	2026-05-01 07:56:16.053386+00
4159315b-85f5-46fc-aaad-51dc257d8088	5	1	bob-builder-builder	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-06 13:37:01.864182+00	2026-05-06 15:30:05.156397+00
1db43cd4-ed38-4169-8c53-4e21a029bc22	1	1	the-mabinogion-test-2	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-07 10:42:59.559227+00	2026-05-07 10:42:59.559227+00
8dd96574-0be3-44fd-9bf7-6b0b5c6713d7	1	1	the-mabinogion-test2	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-07 10:43:19.846451+00	2026-05-07 10:43:19.846451+00
57f29275-2f18-42ec-bdd5-6d9ebb63d181	2	1	title-1234512345	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-07 10:45:54.228851+00	2026-05-07 10:45:54.228851+00
7dcf837d-00d6-47b9-88f1-9094d842a192	2	1	title-1234512345-2	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-07 10:46:05.911561+00	2026-05-07 10:46:05.911561+00
462ac96f-db26-4431-b36c-ec263a03e045	4	1	artifact-1	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-06 15:12:01.795988+00	2026-05-07 15:53:53.072878+00
7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	1	1	testinger	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-04-24 14:39:36.831529+00	2026-05-07 16:07:50.883021+00
8eef3ae7-a499-4c1b-8974-2f386801b5b4	1	1	the-mabinogion-test	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	\N	\N	2026-05-07 10:42:09.542411+00	2026-05-08 08:29:26.91293+00
\.


--
-- Data for Name: content_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_locations (content_item_id, location_id, relationship_type, sort_order, created_at) FROM stdin;
62d49877-9f05-4f27-917c-3c61719bd62a	67a7d3bd-f0d6-4056-8b17-cd43caf2979f	primary	0	2026-05-06 12:41:52.165624+00
4159315b-85f5-46fc-aaad-51dc257d8088	92dc4897-c788-4808-a7ba-1a41e3436ad0	primary	0	2026-05-06 15:29:18.958184+00
462ac96f-db26-4431-b36c-ec263a03e045	0b66606a-f50c-4cf9-a8f9-6fa9ea9bbf3c	primary	0	2026-05-07 15:53:49.274219+00
7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	67a7d3bd-f0d6-4056-8b17-cd43caf2979f	primary	0	2026-05-07 16:07:38.847245+00
7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	e0408a79-dde3-4bb5-8eef-dbda043fd2d1	primary	0	2026-05-07 16:07:47.530475+00
7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	75d0053d-138a-45d7-862b-fbaa2d2310bc	primary	0	2026-05-07 16:15:37.761767+00
8eef3ae7-a499-4c1b-8974-2f386801b5b4	f2b5372f-820a-4bab-9e05-5ee40c65a673	primary	0	2026-05-07 16:15:57.030585+00
\.


--
-- Data for Name: content_media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_media (id, content_item_id, media_asset_id, role, sort_order, is_primary, created_at, updated_at) FROM stdin;
786947ed-9c40-4e50-8e13-b5f2fa97d9c5	b233f39d-1d06-4282-909c-9dc43fc687b4	33f01ece-6154-4276-bbc2-91ff683bc830	other	0	f	2026-04-24 14:41:51.30412+00	2026-04-24 14:41:51.30412+00
588ebb2e-0559-4f23-a805-1d32fe83551a	7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	131ed058-a0ed-4f0c-ac33-576a15fc9389	other	0	t	2026-05-01 10:30:01.267179+00	2026-05-01 10:30:01.267179+00
542a2371-a0af-4894-9789-15ac7f89ab42	62d49877-9f05-4f27-917c-3c61719bd62a	ad04c65d-efb6-4a62-a52f-a5528c9f8e3c	other	0	t	2026-05-05 11:36:13.499877+00	2026-05-05 11:36:13.499877+00
2d04aaa7-2977-434a-88a1-9ecd854cb168	62d49877-9f05-4f27-917c-3c61719bd62a	ad04c65d-efb6-4a62-a52f-a5528c9f8e3c	other	0	f	2026-05-05 11:37:08.276512+00	2026-05-05 11:37:08.276512+00
172bb758-a5af-48ff-b983-81b0a142b758	62d49877-9f05-4f27-917c-3c61719bd62a	48aa212c-9568-4e73-9ceb-4f0c5943e24e	other	0	f	2026-05-05 14:22:34.189711+00	2026-05-05 14:35:15.538146+00
8873e922-51cb-4108-9ce2-57bf84eed56a	cf91c0c5-0d03-413e-8e2d-5f94f5aaeb54	affb1904-0523-49fc-a888-6c487e9e26c6	other	0	t	2026-05-06 14:30:16.020228+00	2026-05-06 14:30:16.020228+00
7ff515a2-0b54-4478-9487-f4f318599d1d	7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	242cda4e-f1b6-46aa-8c11-fd88ee59a663	other	1	f	2026-05-08 13:50:43.639554+00	2026-05-08 13:50:43.639554+00
\.


--
-- Data for Name: content_status_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_status_translations (content_status_id, language_code, label) FROM stdin;
1	en	Draft
2	en	Preview
3	en	Published
4	en	Archived
1	cy	Drafft
2	cy	Rhagolwg
3	cy	Cyhoeddedig
4	cy	Archifwyd
\.


--
-- Data for Name: content_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_statuses (id, code, is_public, sort_order, created_at) FROM stdin;
1	draft	f	1	2026-04-20 14:08:02.714348+00
2	preview	f	2	2026-04-20 14:08:02.714348+00
3	published	t	3	2026-04-20 14:08:02.714348+00
4	archived	f	4	2026-04-20 14:08:02.714348+00
\.


--
-- Data for Name: content_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_tags (content_item_id, tag_id, created_at) FROM stdin;
\.


--
-- Data for Name: content_type_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_type_translations (content_type_id, language_code, label) FROM stdin;
1	en	Book
2	en	Story
3	en	Painting
4	en	Artefact
5	en	Biography
1	cy	Llyfr
2	cy	Stori
3	cy	Paentiad
4	cy	Arteffact
5	cy	Bywgraffiad
\.


--
-- Data for Name: content_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_types (id, code, sort_order, created_at) FROM stdin;
1	book	1	2026-04-20 14:08:02.714348+00
2	story	2	2026-04-20 14:08:02.714348+00
3	painting	3	2026-04-20 14:08:02.714348+00
4	artefact	4	2026-04-20 14:08:02.714348+00
5	biography	5	2026-04-20 14:08:02.714348+00
\.


--
-- Data for Name: historical_era_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.historical_era_translations (historical_era_id, language_code, name, summary) FROM stdin;
\.


--
-- Data for Name: historical_eras; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.historical_eras (id, slug, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: historical_period_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.historical_period_translations (historical_period_id, language_code, name, summary) FROM stdin;
\.


--
-- Data for Name: historical_periods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.historical_periods (id, slug, start_year, end_year, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.languages (code, name, native_name, is_active, is_default, sort_order, created_at) FROM stdin;
en	English	English	t	t	1	2026-04-20 14:08:02.714348+00
cy	Welsh	Cymraeg	t	f	2	2026-04-20 14:08:02.714348+00
\.


--
-- Data for Name: location_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.location_translations (location_id, language_code, title, description) FROM stdin;
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.locations (id, region_id, slug, address_line_1, address_line_2, town, postcode, latitude, longitude, location_type, is_published, created_by, updated_by, created_at, updated_at) FROM stdin;
67a7d3bd-f0d6-4056-8b17-cd43caf2979f	\N	location-62d49877-9f05-4f27-917c-3c61719bd62a	Thomas Dyke Close	\N	Merthyr Tydfil	CF47 9DZ	51.760379	-3.371065	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-06 12:41:52.097587+00	2026-05-06 12:54:38.045475+00
909d6570-5a07-40c5-b3cd-ff17f68ae40f	\N	location-7da7a0ba-cb9c-44d6-9a78-a464fe24a4fe	Merthyr Tydfil, CF47 8UN, Merthyr Tydfil, CF47 8UN	\N	\N	\N	51.750592	-3.375378	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-07 15:45:51.352088+00	2026-05-07 15:45:51.352088+00
290eff29-b74c-46ac-943f-217ce9b19c21	\N	location-df4dbf8b-17ae-43d3-b250-0a9236401e85	Newcastle Street	\N	Merthyr Tydfil	CF47 0BH	51.747370	-3.377609	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-07 15:45:36.790728+00	2026-05-07 15:48:09.58862+00
92dc4897-c788-4808-a7ba-1a41e3436ad0	\N	location-4159315b-85f5-46fc-aaad-51dc257d8088	The Quar	\N	Merthyr Tydfil	CF47 8NU	51.756136	-3.384390	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-06 15:29:18.891475+00	2026-05-07 15:48:36.278598+00
0b66606a-f50c-4cf9-a8f9-6fa9ea9bbf3c	\N	location-5fb2c70a-2e57-48f5-8ec6-9807ec6a80e4	High Street	\N	Merthyr Tydfil	CF47 9JP	51.755672	-3.366022	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-07 15:45:54.572632+00	2026-05-07 15:48:50.068061+00
90ca6319-dca4-4a44-b1aa-22bd2a0ca698	\N	location-462ac96f-db26-4431-b36c-ec263a03e045	Gwaunfarren Road	\N	Merthyr Tydfil	CF47 9AN	51.758700	-3.371429	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-07 15:34:35.510406+00	2026-05-07 15:50:22.077821+00
fb961363-778f-4b94-b35f-8b3b642507b2	\N	location-b46bce2d-da0d-44a2-9f0b-29e58c17e59b	A470	\N	Merthyr Tydfil	CF47 8NJ	51.739971	-3.383574	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-07 15:45:47.08452+00	2026-05-07 15:50:30.413625+00
a807718e-932c-4faf-a040-c6e92eac55b2	\N	location-c5abb0d1-578c-440c-8701-68e43ea5a127	3 Ivor Street / Charlotte Gardens	\N	Pant	CF48 3LJ	51.764544	-3.353298	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-07 15:45:42.661575+00	2026-05-07 15:53:30.433607+00
c2956d40-9e80-4f17-919e-762620d546dc	\N	location-7a9fec53-d1cd-4071-a622-4292c555acd6	Gurnos Road	\N	Merthyr Tydfil	CF47 9DT	51.763694	-3.385334	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-07 15:45:48.487499+00	2026-05-07 15:53:44.300832+00
df71a16d-ec4c-4300-9cd5-3cdc4de36d95	\N	location-0bd8460f-9264-4a48-b8be-d69b54a76ee3	Pant, CF48 3SS	\N	Pant	CF48 3SS	51.777783	-3.359950	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-07 16:07:16.380509+00	2026-05-07 16:07:16.380509+00
e0408a79-dde3-4bb5-8eef-dbda043fd2d1	\N	location-268b6d64-70f7-4033-a4ab-576b1fc2e80d	Pant	\N	Pant	\N	51.780886	-3.347418	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-07 16:07:47.454792+00	2026-05-07 16:07:47.454792+00
75d0053d-138a-45d7-862b-fbaa2d2310bc	\N	location-abe93682-f3a4-4b36-b7ed-df28dad3b396	Bogey Road	\N	Merthyr Tydfil	CF48 4AE	51.742214	-3.327827	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-07 16:15:37.585365+00	2026-05-07 16:15:37.585365+00
f2b5372f-820a-4bab-9e05-5ee40c65a673	\N	location-b8c4a88e-40a6-428e-abe3-ff77fba72f31	Troed-y-rhiw, Merthyr Tydfil County Borough, Wales, United Kingdom	\N	\N	\N	51.701810	-3.358727	landmark	t	03c6264c-c99e-43ee-a85a-964444653e4e	03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-07 16:15:56.979021+00	2026-05-07 16:15:56.979021+00
\.


--
-- Data for Name: map_region_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.map_region_translations (map_region_id, language_code, name, summary) FROM stdin;
\.


--
-- Data for Name: map_regions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.map_regions (id, slug, map_shape_geojson, centroid_lat, centroid_lng, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: media_asset_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.media_asset_translations (media_asset_id, language_code, alt_text, caption) FROM stdin;
\.


--
-- Data for Name: media_assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.media_assets (id, storage_path, file_name, mime_type, file_size_bytes, width, height, duration_seconds, credit, uploaded_by, created_at, updated_at) FROM stdin;
ff127709-c5f8-4e5f-beac-85cda1fd532f	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/97d70e4e-e2fb-485c-bb9c-68324f56955f.jpg	20260406_170046.jpg	image/jpeg	5786423	3000	4000	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-23 15:05:36.429745+00	2026-04-23 15:05:36.429745+00
043e02d6-782d-4324-bcc1-c23a3249545d	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/a677457f-dbe9-4e87-87cc-947a228b8c7f.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 08:53:19.593362+00	2026-04-24 08:53:19.593362+00
e5ff00b1-8f14-4fac-a6e1-635992c72f3a	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/728f0326-9ed1-4fec-8fb0-9597fbcc8474.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 08:53:35.766314+00	2026-04-24 08:53:35.766314+00
140bdb03-c226-4000-b05e-c754d6aa54f6	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/fa23e20e-ddbf-40f4-8777-fa96f0da92a4.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 11:51:19.78681+00	2026-04-24 11:51:19.78681+00
39ce7800-ca45-473f-a1f4-fee70717d371	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/2a8a9620-1675-4528-900e-f32f346c92ab.jpg	bob.jpg	image/jpeg	21924	250	379	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 11:51:31.191295+00	2026-04-24 11:51:31.191295+00
b81a05b2-a0ab-40dd-ac0e-d210f1508698	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/dda245a6-61ec-49ab-9e16-f76ba5ec5cd7.png	CMS_overview.png	image/png	150620	1622	1252	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 11:51:36.380853+00	2026-04-24 11:51:36.380853+00
565594df-6d64-4007-91ac-5e78fcb4bbdc	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/eaa0629c-93cb-4ba3-8559-5d939f650608.png	CMS_overview_new_content.png	image/png	140089	1597	1226	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 11:51:41.358785+00	2026-04-24 11:51:41.358785+00
188b6265-c7b4-4936-9748-8b7ad44e3207	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/4acc2407-dfaf-465d-a8e3-41b0b0c9802e.png	db.png	image/png	981758	1536	1024	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 11:51:47.166438+00	2026-04-24 11:51:47.166438+00
3cc27b56-9402-4c2a-acae-98e04a2ca0bc	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/f970fbca-2687-4327-bd9c-e1d514d38f18.jpg	1000009124.jpg	image/jpeg	6177272	3000	4000	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 11:51:56.074756+00	2026-04-24 11:51:56.074756+00
91d42e0e-fe77-4183-9f98-c86e3e16b3e1	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/93e4d2e0-92cc-4700-9813-c300e03477e3.png	CMS_overview_books_images.png	image/png	200454	1552	1174	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 11:52:04.628015+00	2026-04-24 11:52:04.628015+00
be28c339-1f79-4b54-a45b-6eb5e54054ca	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/094172a3-05d6-423d-9a66-b6e87798e65f.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 12:43:37.492952+00	2026-04-24 12:43:37.492952+00
3ad9e1a6-7f45-44d7-8ac4-76da46630d01	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/c941f776-0edb-4de2-852d-00654d1b6218.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 12:43:43.840979+00	2026-04-24 12:43:43.840979+00
d81062ca-1b95-408e-b6fe-9134ed3e3034	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/ac3a01d8-a40a-476f-aa93-e8c8e2399466.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 12:43:50.226283+00	2026-04-24 12:43:50.226283+00
809de2b4-c5b3-4e08-b0a2-8769c3375d74	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/95775095-a4a4-4536-8f20-0f98d4b776d0.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 12:44:02.033854+00	2026-04-24 12:44:02.033854+00
c3c76c6a-4583-4203-bc61-9abfb441dd71	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/368c1429-1b72-4c77-8723-e351485be5f8.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 12:44:06.302225+00	2026-04-24 12:44:06.302225+00
0ad39ace-8ee9-490f-b485-49034258203e	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/ec19694d-9490-4ceb-a96b-6d1a60396795.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 12:44:11.681699+00	2026-04-24 12:44:11.681699+00
4156725d-0d6b-421f-ab46-86abb00b3380	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/5c238e15-2736-4d7c-a2be-e31b090f314c.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 14:22:53.162045+00	2026-04-24 14:22:53.162045+00
62a97ae4-d69c-4a09-b544-1dd69e485cc2	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/ac12ad3d-71b0-435b-9c5f-740047cc0424.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 14:23:22.062725+00	2026-04-24 14:23:22.062725+00
33f01ece-6154-4276-bbc2-91ff683bc830	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/853f699b-5c20-4e95-b722-ea95b995d9ed.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-04-24 14:41:36.059698+00	2026-04-24 14:41:36.059698+00
131ed058-a0ed-4f0c-ac33-576a15fc9389	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/151a99fb-6af2-4c12-8085-9f8ed5f6049c.png	login.png	image/png	81508	1695	1271	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-01 10:30:01.1249+00	2026-05-01 10:30:01.1249+00
290ecec3-4a29-482d-a259-d94be05d1fc5	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/stories/images/91bfc804-0af4-4d5c-9cf6-ddbe8ef3fa42.png	p1.png	image/png	277327	3150	1870	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-05 11:26:05.603809+00	2026-05-05 11:26:05.603809+00
ad04c65d-efb6-4a62-a52f-a5528c9f8e3c	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/7d708868-0362-4e9c-918f-64b7cd4e6bc2.jpg	microsoft-design-3840x2160-10779.jpg	image/jpeg	4718868	3840	2160	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-05 11:36:13.307717+00	2026-05-05 11:36:13.307717+00
48aa212c-9568-4e73-9ceb-4f0c5943e24e	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/97b7a80a-91a4-44e5-b46d-b0554c34035c.png	p1.png	image/png	277327	3150	1870	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-05 14:22:34.057946+00	2026-05-05 14:22:34.057946+00
affb1904-0523-49fc-a888-6c487e9e26c6	https://pub-39f96b0c53c747249051637ecc1adf15.r2.dev/content/book/images/28cff8d9-e469-403a-b2ae-0c035ee74ba2.jpg	20260406_165418.jpg	image/jpeg	9412258	3000	4000	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-06 14:30:15.913802+00	2026-05-06 14:30:15.913802+00
242cda4e-f1b6-46aa-8c11-fd88ee59a663	content/book/images/90d58ed0-93ad-4847-947c-9c73fc71e76a.png	menuLogo-cy.png	image/png	13160	457	73	\N		03c6264c-c99e-43ee-a85a-964444653e4e	2026-05-08 13:50:43.55106+00	2026-05-08 13:50:43.55106+00
\.


--
-- Data for Name: painting_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.painting_translations (painting_content_item_id, language_code, detail_notes) FROM stdin;
eb575f8b-5efb-49bf-bf21-a0f28a30c230	en	\N
\.


--
-- Data for Name: paintings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.paintings (content_item_id, artist_name, year_created, medium, dimensions, current_collection, image_credit, created_at, updated_at) FROM stdin;
eb575f8b-5efb-49bf-bf21-a0f28a30c230	\N	\N	Watercolour	\N	\N	\N	2026-05-06 13:21:11.643344+00	2026-05-06 13:30:52.518241+00
\.


--
-- Data for Name: qr_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.qr_codes (id, content_item_id, target_url, image_media_asset_id, generated_at, generated_by, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: related_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.related_content (parent_content_item_id, child_content_item_id, relationship_type, sort_order, created_at) FROM stdin;
7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	62d49877-9f05-4f27-917c-3c61719bd62a	related	0	2026-05-06 14:28:59.50364+00
7f7c305a-bfc3-4c2c-a52e-53c1f0a76366	b233f39d-1d06-4282-909c-9dc43fc687b4	related	0	2026-05-06 14:29:07.682688+00
4159315b-85f5-46fc-aaad-51dc257d8088	62d49877-9f05-4f27-917c-3c61719bd62a	related	0	2026-05-06 15:29:47.368689+00
4159315b-85f5-46fc-aaad-51dc257d8088	462ac96f-db26-4431-b36c-ec263a03e045	related	0	2026-05-06 15:29:55.600428+00
4159315b-85f5-46fc-aaad-51dc257d8088	cf91c0c5-0d03-413e-8e2d-5f94f5aaeb54	related	0	2026-05-06 15:30:00.937205+00
8eef3ae7-a499-4c1b-8974-2f386801b5b4	62d49877-9f05-4f27-917c-3c61719bd62a	related	0	2026-05-07 10:42:52.188911+00
57f29275-2f18-42ec-bdd5-6d9ebb63d181	eb575f8b-5efb-49bf-bf21-a0f28a30c230	related	0	2026-05-07 10:46:01.258915+00
\.


--
-- Data for Name: stories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stories (content_item_id, story_type_id, related_person_name, created_at, updated_at) FROM stdin;
1c8707cd-41f9-4c37-a9af-fa45de6896ff	1	\N	2026-05-06 13:03:17.702467+00	2026-05-06 13:03:17.702467+00
c61ee4aa-d9cd-409e-b28b-8dfeaa1c846d	1	\N	2026-05-06 12:57:10.978921+00	2026-05-06 13:04:58.560407+00
26c2c763-0389-48cb-80fe-939d293a91b8	1	\N	2026-05-06 12:58:00.322721+00	2026-05-06 13:05:13.996355+00
9ceae33d-d843-461e-81bf-df1360c9915a	2	\N	2026-05-06 13:17:36.310265+00	2026-05-06 13:17:36.310265+00
6945c3cc-5817-4ba2-9d5e-f39ca1d69428	3	\N	2026-05-06 13:18:00.323746+00	2026-05-06 13:18:00.323746+00
9c0a4769-0ffd-4e4f-bb31-d4e48f37359f	3	\N	2026-05-06 13:18:17.317752+00	2026-05-06 13:18:17.317752+00
57f29275-2f18-42ec-bdd5-6d9ebb63d181	2	\N	2026-05-07 10:45:54.477793+00	2026-05-07 10:45:54.477793+00
7dcf837d-00d6-47b9-88f1-9094d842a192	2	\N	2026-05-07 10:46:06.139404+00	2026-05-07 10:46:06.139404+00
\.


--
-- Data for Name: story_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.story_translations (story_content_item_id, language_code, event_details) FROM stdin;
1c8707cd-41f9-4c37-a9af-fa45de6896ff	en	\N
c61ee4aa-d9cd-409e-b28b-8dfeaa1c846d	en	\N
26c2c763-0389-48cb-80fe-939d293a91b8	en	\N
9ceae33d-d843-461e-81bf-df1360c9915a	en	\N
6945c3cc-5817-4ba2-9d5e-f39ca1d69428	en	\N
9c0a4769-0ffd-4e4f-bb31-d4e48f37359f	en	\N
57f29275-2f18-42ec-bdd5-6d9ebb63d181	en	content
7dcf837d-00d6-47b9-88f1-9094d842a192	en	content
\.


--
-- Data for Name: story_type_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.story_type_translations (story_type_id, language_code, label) FROM stdin;
1	en	Myth / Folklore
2	en	Historical Event
3	en	Period Vignette
1	cy	Myth / Llên Gwerin
2	cy	Digwyddiad Hanesyddol
3	cy	Darlun Cyfnod
4	en	another type
\.


--
-- Data for Name: story_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.story_types (id, code, sort_order, created_at) FROM stdin;
1	myth_folklore	1	2026-04-20 14:08:02.714348+00
2	historical_event	2	2026-04-20 14:08:02.714348+00
3	period_vignette	3	2026-04-20 14:08:02.714348+00
4	another_type	0	2026-05-05 11:07:59.012588+00
\.


--
-- Data for Name: tag_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tag_translations (tag_id, language_code, name) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tags (id, slug, tag_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-05-06 07:37:53
20211116045059	2026-05-06 07:37:53
20211116050929	2026-05-06 07:37:53
20211116051442	2026-05-06 07:37:53
20211116212300	2026-05-06 07:37:53
20211116213355	2026-05-06 07:37:53
20211116213934	2026-05-06 07:37:53
20211116214523	2026-05-06 07:37:53
20211122062447	2026-05-06 07:37:53
20211124070109	2026-05-06 07:37:53
20211202204204	2026-05-06 07:37:53
20211202204605	2026-05-06 07:37:53
20211210212804	2026-05-06 07:37:53
20211228014915	2026-05-06 07:37:53
20220107221237	2026-05-06 07:37:53
20220228202821	2026-05-06 07:37:53
20220312004840	2026-05-06 07:37:53
20220603231003	2026-05-06 07:37:53
20220603232444	2026-05-06 07:37:53
20220615214548	2026-05-06 07:37:53
20220712093339	2026-05-06 07:37:53
20220908172859	2026-05-06 07:37:53
20220916233421	2026-05-06 07:37:53
20230119133233	2026-05-06 07:37:53
20230128025114	2026-05-06 07:37:53
20230128025212	2026-05-06 07:37:53
20230227211149	2026-05-06 07:37:53
20230228184745	2026-05-06 07:37:53
20230308225145	2026-05-06 07:37:53
20230328144023	2026-05-06 07:37:53
20231018144023	2026-05-06 07:37:53
20231204144023	2026-05-06 07:37:53
20231204144024	2026-05-06 07:37:53
20231204144025	2026-05-06 07:37:53
20240108234812	2026-05-06 07:37:53
20240109165339	2026-05-06 07:37:53
20240227174441	2026-05-06 07:37:53
20240311171622	2026-05-06 07:37:53
20240321100241	2026-05-06 07:37:53
20240401105812	2026-05-06 07:37:53
20240418121054	2026-05-06 07:37:53
20240523004032	2026-05-06 07:37:54
20240618124746	2026-05-06 07:37:54
20240801235015	2026-05-06 07:37:54
20240805133720	2026-05-06 07:37:54
20240827160934	2026-05-06 07:37:54
20240919163303	2026-05-06 07:37:54
20240919163305	2026-05-06 07:37:54
20241019105805	2026-05-06 09:31:54
20241030150047	2026-05-06 09:31:54
20241108114728	2026-05-06 09:31:54
20241121104152	2026-05-06 09:31:54
20241130184212	2026-05-06 09:31:54
20241220035512	2026-05-06 09:31:54
20241220123912	2026-05-06 09:31:54
20241224161212	2026-05-06 09:31:54
20250107150512	2026-05-06 09:31:54
20250110162412	2026-05-06 09:31:54
20250123174212	2026-05-06 09:31:54
20250128220012	2026-05-06 09:31:54
20250506224012	2026-05-06 09:31:54
20250523164012	2026-05-06 09:31:54
20250714121412	2026-05-06 09:31:54
20250905041441	2026-05-06 09:31:54
20251103001201	2026-05-06 09:31:54
20251120212548	2026-05-06 09:31:54
20251120215549	2026-05-06 09:31:54
20260218120000	2026-05-06 09:31:54
20260326120000	2026-05-06 09:31:54
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-05-06 07:38:19.923338
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-05-06 07:38:19.965724
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-05-06 07:38:19.970821
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-05-06 07:38:19.994567
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-05-06 07:38:20.010318
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-05-06 07:38:20.015946
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-05-06 07:38:20.021777
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-05-06 07:38:20.027671
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-05-06 07:38:20.03305
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-05-06 07:38:20.039826
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-05-06 07:38:20.045651
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-05-06 07:38:20.051439
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-05-06 07:38:20.0573
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-05-06 07:38:20.062913
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-05-06 07:38:20.068814
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-05-06 07:38:20.096379
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-05-06 07:38:20.10494
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-05-06 07:38:20.110672
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-05-06 07:38:20.117513
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-05-06 07:38:20.124975
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-05-06 07:38:20.131941
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-05-06 07:38:20.139099
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-05-06 07:38:20.155206
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-05-06 07:38:20.165586
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-05-06 07:38:20.171331
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-05-06 07:38:20.178844
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-05-06 07:38:20.186436
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-05-06 07:38:20.192313
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-05-06 07:38:20.198907
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-05-06 07:38:20.204268
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-05-06 07:38:20.209459
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-05-06 07:38:20.214407
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-05-06 07:38:20.219315
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-05-06 07:38:20.224096
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-05-06 07:38:20.228874
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-05-06 07:38:20.234189
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-05-06 07:38:20.240497
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-05-06 07:38:20.245863
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-05-06 07:38:20.251725
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-05-06 07:38:20.26315
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-05-06 07:38:20.268053
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-05-06 07:38:20.27306
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-05-06 07:38:20.277901
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-05-06 07:38:20.282756
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-05-06 07:38:20.28757
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-05-06 07:38:20.293284
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-05-06 07:38:20.304367
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-05-06 07:38:20.309655
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-05-06 07:38:20.314793
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-05-06 07:38:20.332605
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-05-06 07:38:20.338278
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-05-06 07:38:20.957542
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-05-06 07:38:20.959923
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-05-06 07:38:20.971426
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-05-06 07:38:20.975513
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-05-06 07:38:20.977585
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-05-06 07:38:20.990449
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-05-06 07:38:20.995711
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-05-06 07:38:20.984057
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-05-14 13:04:00.664071
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-05-14 13:04:00.67217
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 120, true);


--
-- Name: content_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_statuses_id_seq', 4, true);


--
-- Name: content_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_types_id_seq', 5, true);


--
-- Name: story_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.story_types_id_seq', 4, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: admin_invitations admin_invitations_email_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_invitations
    ADD CONSTRAINT admin_invitations_email_token_key UNIQUE (email, token);


--
-- Name: admin_invitations admin_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_invitations
    ADD CONSTRAINT admin_invitations_pkey PRIMARY KEY (id);


--
-- Name: admin_invitations admin_invitations_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_invitations
    ADD CONSTRAINT admin_invitations_token_key UNIQUE (token);


--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: artefact_categories artefact_categories_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artefact_categories
    ADD CONSTRAINT artefact_categories_code_key UNIQUE (code);


--
-- Name: artefact_categories artefact_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artefact_categories
    ADD CONSTRAINT artefact_categories_pkey PRIMARY KEY (id);


--
-- Name: artefact_category_translations artefact_category_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artefact_category_translations
    ADD CONSTRAINT artefact_category_translations_pkey PRIMARY KEY (artefact_category_id, language_code);


--
-- Name: artefact_translations artefact_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artefact_translations
    ADD CONSTRAINT artefact_translations_pkey PRIMARY KEY (artefact_content_item_id, language_code);


--
-- Name: artefacts artefacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artefacts
    ADD CONSTRAINT artefacts_pkey PRIMARY KEY (content_item_id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: biographies biographies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biographies
    ADD CONSTRAINT biographies_pkey PRIMARY KEY (content_item_id);


--
-- Name: biography_translations biography_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biography_translations
    ADD CONSTRAINT biography_translations_pkey PRIMARY KEY (biography_content_item_id, language_code);


--
-- Name: book_theme_books book_theme_books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_theme_books
    ADD CONSTRAINT book_theme_books_pkey PRIMARY KEY (book_theme_id, book_content_item_id);


--
-- Name: book_theme_paintings book_theme_paintings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_theme_paintings
    ADD CONSTRAINT book_theme_paintings_pkey PRIMARY KEY (book_theme_id, painting_content_item_id);


--
-- Name: book_theme_translations book_theme_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_theme_translations
    ADD CONSTRAINT book_theme_translations_pkey PRIMARY KEY (book_theme_id, language_code);


--
-- Name: book_themes book_themes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_themes
    ADD CONSTRAINT book_themes_pkey PRIMARY KEY (id);


--
-- Name: book_themes book_themes_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_themes
    ADD CONSTRAINT book_themes_slug_key UNIQUE (slug);


--
-- Name: book_translations book_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_translations
    ADD CONSTRAINT book_translations_pkey PRIMARY KEY (book_content_item_id, language_code);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (content_item_id);


--
-- Name: content_item_translations content_item_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_item_translations
    ADD CONSTRAINT content_item_translations_pkey PRIMARY KEY (content_item_id, language_code);


--
-- Name: content_items content_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_pkey PRIMARY KEY (id);


--
-- Name: content_items content_items_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_slug_key UNIQUE (slug);


--
-- Name: content_locations content_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_locations
    ADD CONSTRAINT content_locations_pkey PRIMARY KEY (content_item_id, location_id);


--
-- Name: content_media content_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_media
    ADD CONSTRAINT content_media_pkey PRIMARY KEY (id);


--
-- Name: content_status_translations content_status_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_status_translations
    ADD CONSTRAINT content_status_translations_pkey PRIMARY KEY (content_status_id, language_code);


--
-- Name: content_statuses content_statuses_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_statuses
    ADD CONSTRAINT content_statuses_code_key UNIQUE (code);


--
-- Name: content_statuses content_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_statuses
    ADD CONSTRAINT content_statuses_pkey PRIMARY KEY (id);


--
-- Name: content_tags content_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_tags
    ADD CONSTRAINT content_tags_pkey PRIMARY KEY (content_item_id, tag_id);


--
-- Name: content_type_translations content_type_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_type_translations
    ADD CONSTRAINT content_type_translations_pkey PRIMARY KEY (content_type_id, language_code);


--
-- Name: content_types content_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_types
    ADD CONSTRAINT content_types_code_key UNIQUE (code);


--
-- Name: content_types content_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_types
    ADD CONSTRAINT content_types_pkey PRIMARY KEY (id);


--
-- Name: historical_era_translations historical_era_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_era_translations
    ADD CONSTRAINT historical_era_translations_pkey PRIMARY KEY (historical_era_id, language_code);


--
-- Name: historical_eras historical_eras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_eras
    ADD CONSTRAINT historical_eras_pkey PRIMARY KEY (id);


--
-- Name: historical_eras historical_eras_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_eras
    ADD CONSTRAINT historical_eras_slug_key UNIQUE (slug);


--
-- Name: historical_period_translations historical_period_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_period_translations
    ADD CONSTRAINT historical_period_translations_pkey PRIMARY KEY (historical_period_id, language_code);


--
-- Name: historical_periods historical_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_periods
    ADD CONSTRAINT historical_periods_pkey PRIMARY KEY (id);


--
-- Name: historical_periods historical_periods_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_periods
    ADD CONSTRAINT historical_periods_slug_key UNIQUE (slug);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (code);


--
-- Name: languages languages_single_default; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_single_default UNIQUE (is_default) DEFERRABLE;


--
-- Name: location_translations location_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_translations
    ADD CONSTRAINT location_translations_pkey PRIMARY KEY (location_id, language_code);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: locations locations_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_slug_key UNIQUE (slug);


--
-- Name: map_region_translations map_region_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_region_translations
    ADD CONSTRAINT map_region_translations_pkey PRIMARY KEY (map_region_id, language_code);


--
-- Name: map_regions map_regions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_regions
    ADD CONSTRAINT map_regions_pkey PRIMARY KEY (id);


--
-- Name: map_regions map_regions_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_regions
    ADD CONSTRAINT map_regions_slug_key UNIQUE (slug);


--
-- Name: media_asset_translations media_asset_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_asset_translations
    ADD CONSTRAINT media_asset_translations_pkey PRIMARY KEY (media_asset_id, language_code);


--
-- Name: media_assets media_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_pkey PRIMARY KEY (id);


--
-- Name: painting_translations painting_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.painting_translations
    ADD CONSTRAINT painting_translations_pkey PRIMARY KEY (painting_content_item_id, language_code);


--
-- Name: paintings paintings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paintings
    ADD CONSTRAINT paintings_pkey PRIMARY KEY (content_item_id);


--
-- Name: qr_codes qr_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_pkey PRIMARY KEY (id);


--
-- Name: related_content related_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.related_content
    ADD CONSTRAINT related_content_pkey PRIMARY KEY (parent_content_item_id, child_content_item_id);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (content_item_id);


--
-- Name: story_translations story_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_translations
    ADD CONSTRAINT story_translations_pkey PRIMARY KEY (story_content_item_id, language_code);


--
-- Name: story_type_translations story_type_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_type_translations
    ADD CONSTRAINT story_type_translations_pkey PRIMARY KEY (story_type_id, language_code);


--
-- Name: story_types story_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_types
    ADD CONSTRAINT story_types_code_key UNIQUE (code);


--
-- Name: story_types story_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_types
    ADD CONSTRAINT story_types_pkey PRIMARY KEY (id);


--
-- Name: tag_translations tag_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_translations
    ADD CONSTRAINT tag_translations_pkey PRIMARY KEY (tag_id, language_code);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: idx_artefact_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artefact_translations_language_code ON public.artefact_translations USING btree (language_code);


--
-- Name: idx_audit_log_admin_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_admin_user_id ON public.audit_log USING btree (admin_user_id);


--
-- Name: idx_audit_log_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_entity ON public.audit_log USING btree (entity_type, entity_id);


--
-- Name: idx_biography_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_biography_translations_language_code ON public.biography_translations USING btree (language_code);


--
-- Name: idx_book_theme_books_book; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_theme_books_book ON public.book_theme_books USING btree (book_content_item_id);


--
-- Name: idx_book_theme_paintings_painting; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_theme_paintings_painting ON public.book_theme_paintings USING btree (painting_content_item_id);


--
-- Name: idx_book_theme_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_theme_translations_language_code ON public.book_theme_translations USING btree (language_code);


--
-- Name: idx_book_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_translations_language_code ON public.book_translations USING btree (language_code);


--
-- Name: idx_content_item_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_item_translations_language_code ON public.content_item_translations USING btree (language_code);


--
-- Name: idx_content_items_content_status_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_items_content_status_id ON public.content_items USING btree (content_status_id);


--
-- Name: idx_content_items_content_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_items_content_type_id ON public.content_items USING btree (content_type_id);


--
-- Name: idx_content_items_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_items_featured ON public.content_items USING btree (featured);


--
-- Name: idx_content_items_historical_era_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_items_historical_era_id ON public.content_items USING btree (historical_era_id);


--
-- Name: idx_content_items_historical_period_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_items_historical_period_id ON public.content_items USING btree (historical_period_id);


--
-- Name: idx_content_items_published_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_items_published_at ON public.content_items USING btree (published_at);


--
-- Name: idx_content_locations_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_locations_location_id ON public.content_locations USING btree (location_id);


--
-- Name: idx_content_media_content_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_media_content_item_id ON public.content_media USING btree (content_item_id);


--
-- Name: idx_content_media_media_asset_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_media_media_asset_id ON public.content_media USING btree (media_asset_id);


--
-- Name: idx_content_media_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_media_role ON public.content_media USING btree (role);


--
-- Name: idx_content_tags_tag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_tags_tag_id ON public.content_tags USING btree (tag_id);


--
-- Name: idx_historical_era_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historical_era_translations_language_code ON public.historical_era_translations USING btree (language_code);


--
-- Name: idx_historical_period_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historical_period_translations_language_code ON public.historical_period_translations USING btree (language_code);


--
-- Name: idx_languages_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_languages_active ON public.languages USING btree (is_active);


--
-- Name: idx_location_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_translations_language_code ON public.location_translations USING btree (language_code);


--
-- Name: idx_locations_is_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_locations_is_published ON public.locations USING btree (is_published);


--
-- Name: idx_locations_lat_lng; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_locations_lat_lng ON public.locations USING btree (latitude, longitude);


--
-- Name: idx_locations_region_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_locations_region_id ON public.locations USING btree (region_id);


--
-- Name: idx_map_region_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_map_region_translations_language_code ON public.map_region_translations USING btree (language_code);


--
-- Name: idx_map_regions_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_map_regions_sort_order ON public.map_regions USING btree (sort_order);


--
-- Name: idx_media_asset_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_asset_translations_language_code ON public.media_asset_translations USING btree (language_code);


--
-- Name: idx_media_assets_uploaded_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_assets_uploaded_by ON public.media_assets USING btree (uploaded_by);


--
-- Name: idx_painting_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_painting_translations_language_code ON public.painting_translations USING btree (language_code);


--
-- Name: idx_qr_codes_content_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qr_codes_content_item_id ON public.qr_codes USING btree (content_item_id);


--
-- Name: idx_related_content_child; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_related_content_child ON public.related_content USING btree (child_content_item_id);


--
-- Name: idx_story_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_translations_language_code ON public.story_translations USING btree (language_code);


--
-- Name: idx_tag_translations_language_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tag_translations_language_code ON public.tag_translations USING btree (language_code);


--
-- Name: uq_book_theme_translations_language_title; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_book_theme_translations_language_title ON public.book_theme_translations USING btree (language_code, lower(title));


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: admin_users trg_admin_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: artefacts trg_artefacts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_artefacts_updated_at BEFORE UPDATE ON public.artefacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: biographies trg_biographies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_biographies_updated_at BEFORE UPDATE ON public.biographies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: book_themes trg_book_themes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_book_themes_updated_at BEFORE UPDATE ON public.book_themes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: books trg_books_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: content_items trg_content_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_content_items_updated_at BEFORE UPDATE ON public.content_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: content_media trg_content_media_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_content_media_updated_at BEFORE UPDATE ON public.content_media FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: historical_eras trg_historical_eras_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_historical_eras_updated_at BEFORE UPDATE ON public.historical_eras FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: historical_periods trg_historical_periods_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_historical_periods_updated_at BEFORE UPDATE ON public.historical_periods FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: locations trg_locations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: map_regions trg_map_regions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_map_regions_updated_at BEFORE UPDATE ON public.map_regions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: media_assets trg_media_assets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_media_assets_updated_at BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: paintings trg_paintings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_paintings_updated_at BEFORE UPDATE ON public.paintings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: stories trg_stories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_stories_updated_at BEFORE UPDATE ON public.stories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: tags trg_tags_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: admin_invitations admin_invitations_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_invitations
    ADD CONSTRAINT admin_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: artefact_category_translations artefact_category_translations_artefact_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artefact_category_translations
    ADD CONSTRAINT artefact_category_translations_artefact_category_id_fkey FOREIGN KEY (artefact_category_id) REFERENCES public.artefact_categories(id);


--
-- Name: artefact_translations artefact_translations_artefact_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artefact_translations
    ADD CONSTRAINT artefact_translations_artefact_content_item_id_fkey FOREIGN KEY (artefact_content_item_id) REFERENCES public.artefacts(content_item_id) ON DELETE CASCADE;


--
-- Name: artefact_translations artefact_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artefact_translations
    ADD CONSTRAINT artefact_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: artefacts artefacts_artefact_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artefacts
    ADD CONSTRAINT artefacts_artefact_category_id_fkey FOREIGN KEY (artefact_category_id) REFERENCES public.artefact_categories(id);


--
-- Name: artefacts artefacts_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artefacts
    ADD CONSTRAINT artefacts_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: audit_log audit_log_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: biographies biographies_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biographies
    ADD CONSTRAINT biographies_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: biography_translations biography_translations_biography_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biography_translations
    ADD CONSTRAINT biography_translations_biography_content_item_id_fkey FOREIGN KEY (biography_content_item_id) REFERENCES public.biographies(content_item_id) ON DELETE CASCADE;


--
-- Name: biography_translations biography_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biography_translations
    ADD CONSTRAINT biography_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: book_theme_books book_theme_books_book_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_theme_books
    ADD CONSTRAINT book_theme_books_book_content_item_id_fkey FOREIGN KEY (book_content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: book_theme_books book_theme_books_book_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_theme_books
    ADD CONSTRAINT book_theme_books_book_theme_id_fkey FOREIGN KEY (book_theme_id) REFERENCES public.book_themes(id) ON DELETE CASCADE;


--
-- Name: book_theme_paintings book_theme_paintings_book_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_theme_paintings
    ADD CONSTRAINT book_theme_paintings_book_theme_id_fkey FOREIGN KEY (book_theme_id) REFERENCES public.book_themes(id) ON DELETE CASCADE;


--
-- Name: book_theme_paintings book_theme_paintings_painting_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_theme_paintings
    ADD CONSTRAINT book_theme_paintings_painting_content_item_id_fkey FOREIGN KEY (painting_content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: book_theme_translations book_theme_translations_book_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_theme_translations
    ADD CONSTRAINT book_theme_translations_book_theme_id_fkey FOREIGN KEY (book_theme_id) REFERENCES public.book_themes(id) ON DELETE CASCADE;


--
-- Name: book_theme_translations book_theme_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_theme_translations
    ADD CONSTRAINT book_theme_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: book_themes book_themes_content_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_themes
    ADD CONSTRAINT book_themes_content_status_id_fkey FOREIGN KEY (content_status_id) REFERENCES public.content_statuses(id) ON DELETE RESTRICT;


--
-- Name: book_themes book_themes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_themes
    ADD CONSTRAINT book_themes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: book_themes book_themes_published_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_themes
    ADD CONSTRAINT book_themes_published_by_fkey FOREIGN KEY (published_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: book_themes book_themes_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_themes
    ADD CONSTRAINT book_themes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: book_translations book_translations_book_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_translations
    ADD CONSTRAINT book_translations_book_content_item_id_fkey FOREIGN KEY (book_content_item_id) REFERENCES public.books(content_item_id) ON DELETE CASCADE;


--
-- Name: book_translations book_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_translations
    ADD CONSTRAINT book_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: books books_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: content_item_translations content_item_translations_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_item_translations
    ADD CONSTRAINT content_item_translations_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: content_item_translations content_item_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_item_translations
    ADD CONSTRAINT content_item_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: content_items content_items_content_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_content_status_id_fkey FOREIGN KEY (content_status_id) REFERENCES public.content_statuses(id) ON DELETE RESTRICT;


--
-- Name: content_items content_items_content_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_content_type_id_fkey FOREIGN KEY (content_type_id) REFERENCES public.content_types(id) ON DELETE RESTRICT;


--
-- Name: content_items content_items_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: content_items content_items_historical_era_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_historical_era_id_fkey FOREIGN KEY (historical_era_id) REFERENCES public.historical_eras(id) ON DELETE SET NULL;


--
-- Name: content_items content_items_historical_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_historical_period_id_fkey FOREIGN KEY (historical_period_id) REFERENCES public.historical_periods(id) ON DELETE SET NULL;


--
-- Name: content_items content_items_published_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_published_by_fkey FOREIGN KEY (published_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: content_items content_items_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: content_locations content_locations_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_locations
    ADD CONSTRAINT content_locations_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: content_locations content_locations_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_locations
    ADD CONSTRAINT content_locations_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE;


--
-- Name: content_media content_media_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_media
    ADD CONSTRAINT content_media_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: content_media content_media_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_media
    ADD CONSTRAINT content_media_media_asset_id_fkey FOREIGN KEY (media_asset_id) REFERENCES public.media_assets(id) ON DELETE CASCADE;


--
-- Name: content_status_translations content_status_translations_content_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_status_translations
    ADD CONSTRAINT content_status_translations_content_status_id_fkey FOREIGN KEY (content_status_id) REFERENCES public.content_statuses(id) ON DELETE CASCADE;


--
-- Name: content_status_translations content_status_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_status_translations
    ADD CONSTRAINT content_status_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: content_tags content_tags_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_tags
    ADD CONSTRAINT content_tags_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: content_tags content_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_tags
    ADD CONSTRAINT content_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: content_type_translations content_type_translations_content_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_type_translations
    ADD CONSTRAINT content_type_translations_content_type_id_fkey FOREIGN KEY (content_type_id) REFERENCES public.content_types(id) ON DELETE CASCADE;


--
-- Name: content_type_translations content_type_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_type_translations
    ADD CONSTRAINT content_type_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: historical_era_translations historical_era_translations_historical_era_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_era_translations
    ADD CONSTRAINT historical_era_translations_historical_era_id_fkey FOREIGN KEY (historical_era_id) REFERENCES public.historical_eras(id) ON DELETE CASCADE;


--
-- Name: historical_era_translations historical_era_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_era_translations
    ADD CONSTRAINT historical_era_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: historical_period_translations historical_period_translations_historical_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_period_translations
    ADD CONSTRAINT historical_period_translations_historical_period_id_fkey FOREIGN KEY (historical_period_id) REFERENCES public.historical_periods(id) ON DELETE CASCADE;


--
-- Name: historical_period_translations historical_period_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_period_translations
    ADD CONSTRAINT historical_period_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: location_translations location_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_translations
    ADD CONSTRAINT location_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: location_translations location_translations_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_translations
    ADD CONSTRAINT location_translations_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE;


--
-- Name: locations locations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: locations locations_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.map_regions(id) ON DELETE SET NULL;


--
-- Name: locations locations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: map_region_translations map_region_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_region_translations
    ADD CONSTRAINT map_region_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: map_region_translations map_region_translations_map_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_region_translations
    ADD CONSTRAINT map_region_translations_map_region_id_fkey FOREIGN KEY (map_region_id) REFERENCES public.map_regions(id) ON DELETE CASCADE;


--
-- Name: media_asset_translations media_asset_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_asset_translations
    ADD CONSTRAINT media_asset_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: media_asset_translations media_asset_translations_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_asset_translations
    ADD CONSTRAINT media_asset_translations_media_asset_id_fkey FOREIGN KEY (media_asset_id) REFERENCES public.media_assets(id) ON DELETE CASCADE;


--
-- Name: media_assets media_assets_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: painting_translations painting_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.painting_translations
    ADD CONSTRAINT painting_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: painting_translations painting_translations_painting_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.painting_translations
    ADD CONSTRAINT painting_translations_painting_content_item_id_fkey FOREIGN KEY (painting_content_item_id) REFERENCES public.paintings(content_item_id) ON DELETE CASCADE;


--
-- Name: paintings paintings_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paintings
    ADD CONSTRAINT paintings_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: qr_codes qr_codes_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: qr_codes qr_codes_generated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: qr_codes qr_codes_image_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_image_media_asset_id_fkey FOREIGN KEY (image_media_asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;


--
-- Name: related_content related_content_child_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.related_content
    ADD CONSTRAINT related_content_child_content_item_id_fkey FOREIGN KEY (child_content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: related_content related_content_parent_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.related_content
    ADD CONSTRAINT related_content_parent_content_item_id_fkey FOREIGN KEY (parent_content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: stories stories_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- Name: stories stories_story_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_story_type_id_fkey FOREIGN KEY (story_type_id) REFERENCES public.story_types(id) ON DELETE RESTRICT;


--
-- Name: story_translations story_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_translations
    ADD CONSTRAINT story_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: story_translations story_translations_story_content_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_translations
    ADD CONSTRAINT story_translations_story_content_item_id_fkey FOREIGN KEY (story_content_item_id) REFERENCES public.stories(content_item_id) ON DELETE CASCADE;


--
-- Name: story_type_translations story_type_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_type_translations
    ADD CONSTRAINT story_type_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: story_type_translations story_type_translations_story_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_type_translations
    ADD CONSTRAINT story_type_translations_story_type_id_fkey FOREIGN KEY (story_type_id) REFERENCES public.story_types(id) ON DELETE CASCADE;


--
-- Name: tag_translations tag_translations_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_translations
    ADD CONSTRAINT tag_translations_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: tag_translations tag_translations_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_translations
    ADD CONSTRAINT tag_translations_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: book_theme_books Admins can delete book theme books; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete book theme books" ON public.book_theme_books FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.status = 'active'::public.admin_user_status) AND (au.role = ANY (ARRAY['super_admin'::public.admin_role, 'admin'::public.admin_role, 'editor'::public.admin_role]))))));


--
-- Name: book_theme_books Admins can insert book theme books; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert book theme books" ON public.book_theme_books FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.status = 'active'::public.admin_user_status) AND (au.role = ANY (ARRAY['super_admin'::public.admin_role, 'admin'::public.admin_role, 'editor'::public.admin_role]))))));


--
-- Name: book_theme_books Admins can update book theme books; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update book theme books" ON public.book_theme_books FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.status = 'active'::public.admin_user_status) AND (au.role = ANY (ARRAY['super_admin'::public.admin_role, 'admin'::public.admin_role, 'editor'::public.admin_role])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.status = 'active'::public.admin_user_status) AND (au.role = ANY (ARRAY['super_admin'::public.admin_role, 'admin'::public.admin_role, 'editor'::public.admin_role]))))));


--
-- Name: book_theme_books Admins can view book theme books; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view book theme books" ON public.book_theme_books FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.status = 'active'::public.admin_user_status)))));


--
-- Name: admin_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

--
-- Name: artefact_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artefact_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: artefact_category_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artefact_category_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: artefact_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artefact_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: artefacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artefacts ENABLE ROW LEVEL SECURITY;

--
-- Name: artefacts artefacts_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY artefacts_delete_own ON public.artefacts FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = artefacts.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: artefacts artefacts_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY artefacts_insert_own ON public.artefacts FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = artefacts.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: artefacts artefacts_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY artefacts_select_own ON public.artefacts FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = artefacts.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: artefacts artefacts_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY artefacts_update_own ON public.artefacts FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = artefacts.content_item_id) AND (ci.created_by = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = artefacts.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: book_theme_translations authenticated can insert book_theme_translations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated can insert book_theme_translations" ON public.book_theme_translations FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: book_themes authenticated can insert book_themes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated can insert book_themes" ON public.book_themes FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: book_theme_translations authenticated can read book_theme_translations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated can read book_theme_translations" ON public.book_theme_translations FOR SELECT TO authenticated USING (true);


--
-- Name: book_themes authenticated can read book_themes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated can read book_themes" ON public.book_themes FOR SELECT TO authenticated USING (true);


--
-- Name: content_statuses authenticated can read content_statuses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated can read content_statuses" ON public.content_statuses FOR SELECT TO authenticated USING (true);


--
-- Name: content_types authenticated can read content_types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated can read content_types" ON public.content_types FOR SELECT TO authenticated USING (true);


--
-- Name: languages authenticated can read languages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated can read languages" ON public.languages FOR SELECT TO authenticated USING (true);


--
-- Name: story_types authenticated can read story_types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated can read story_types" ON public.story_types FOR SELECT TO authenticated USING (true);


--
-- Name: biographies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.biographies ENABLE ROW LEVEL SECURITY;

--
-- Name: biographies biographies_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY biographies_delete_own ON public.biographies FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = biographies.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: biographies biographies_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY biographies_insert_own ON public.biographies FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = biographies.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: biographies biographies_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY biographies_select_own ON public.biographies FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = biographies.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: biographies biographies_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY biographies_update_own ON public.biographies FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = biographies.content_item_id) AND (ci.created_by = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = biographies.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: biography_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.biography_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: book_theme_books; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.book_theme_books ENABLE ROW LEVEL SECURITY;

--
-- Name: book_theme_paintings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.book_theme_paintings ENABLE ROW LEVEL SECURITY;

--
-- Name: book_theme_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.book_theme_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: book_themes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.book_themes ENABLE ROW LEVEL SECURITY;

--
-- Name: book_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.book_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: book_translations book_translations_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY book_translations_delete_own ON public.book_translations FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = book_translations.book_content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: book_translations book_translations_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY book_translations_insert_own ON public.book_translations FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = book_translations.book_content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: book_translations book_translations_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY book_translations_select_own ON public.book_translations FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = book_translations.book_content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: book_translations book_translations_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY book_translations_update_own ON public.book_translations FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = book_translations.book_content_item_id) AND (ci.created_by = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = book_translations.book_content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: books; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

--
-- Name: books books_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY books_delete_own ON public.books FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = books.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: books books_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY books_insert_own ON public.books FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = books.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: books books_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY books_select_own ON public.books FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = books.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: books books_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY books_update_own ON public.books FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = books.content_item_id) AND (ci.created_by = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = books.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: content_item_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_item_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: content_item_translations content_item_translations_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_item_translations_delete_own ON public.content_item_translations FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = content_item_translations.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: content_item_translations content_item_translations_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_item_translations_insert_own ON public.content_item_translations FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = content_item_translations.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: content_item_translations content_item_translations_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_item_translations_select_own ON public.content_item_translations FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = content_item_translations.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: content_item_translations content_item_translations_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_item_translations_update_own ON public.content_item_translations FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = content_item_translations.content_item_id) AND (ci.created_by = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = content_item_translations.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: content_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

--
-- Name: content_items content_items_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_items_delete_own ON public.content_items FOR DELETE TO authenticated USING ((created_by = auth.uid()));


--
-- Name: content_items content_items_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_items_insert_own ON public.content_items FOR INSERT TO authenticated WITH CHECK (((created_by = auth.uid()) AND (updated_by = auth.uid())));


--
-- Name: content_items content_items_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_items_select_own ON public.content_items FOR SELECT TO authenticated USING ((created_by = auth.uid()));


--
-- Name: content_items content_items_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_items_update_own ON public.content_items FOR UPDATE TO authenticated USING ((created_by = auth.uid())) WITH CHECK ((updated_by = auth.uid()));


--
-- Name: content_locations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_locations ENABLE ROW LEVEL SECURITY;

--
-- Name: content_media; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_media ENABLE ROW LEVEL SECURITY;

--
-- Name: content_media content_media_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_media_insert ON public.content_media FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: content_status_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_status_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: content_statuses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_statuses ENABLE ROW LEVEL SECURITY;

--
-- Name: content_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: content_type_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_type_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: content_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_types ENABLE ROW LEVEL SECURITY;

--
-- Name: historical_era_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.historical_era_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: historical_eras; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.historical_eras ENABLE ROW LEVEL SECURITY;

--
-- Name: historical_period_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.historical_period_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: historical_periods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.historical_periods ENABLE ROW LEVEL SECURITY;

--
-- Name: languages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

--
-- Name: location_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.location_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: locations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

--
-- Name: map_region_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.map_region_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: map_regions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.map_regions ENABLE ROW LEVEL SECURITY;

--
-- Name: media_asset_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.media_asset_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: media_asset_translations media_asset_translations_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY media_asset_translations_insert ON public.media_asset_translations FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: media_assets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

--
-- Name: media_assets media_assets_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY media_assets_insert_own ON public.media_assets FOR INSERT TO authenticated WITH CHECK ((uploaded_by = auth.uid()));


--
-- Name: painting_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.painting_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: paintings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.paintings ENABLE ROW LEVEL SECURITY;

--
-- Name: paintings paintings_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY paintings_delete_own ON public.paintings FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = paintings.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: paintings paintings_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY paintings_insert_own ON public.paintings FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = paintings.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: paintings paintings_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY paintings_select_own ON public.paintings FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = paintings.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: paintings paintings_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY paintings_update_own ON public.paintings FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = paintings.content_item_id) AND (ci.created_by = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = paintings.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: qr_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: related_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.related_content ENABLE ROW LEVEL SECURITY;

--
-- Name: stories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

--
-- Name: stories stories_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stories_delete_own ON public.stories FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = stories.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: stories stories_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stories_insert_own ON public.stories FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = stories.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: stories stories_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stories_select_own ON public.stories FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = stories.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: stories stories_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stories_update_own ON public.stories FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = stories.content_item_id) AND (ci.created_by = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.content_items ci
  WHERE ((ci.id = stories.content_item_id) AND (ci.created_by = auth.uid())))));


--
-- Name: story_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.story_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: story_type_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.story_type_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: story_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.story_types ENABLE ROW LEVEL SECURITY;

--
-- Name: tag_translations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tag_translations ENABLE ROW LEVEL SECURITY;

--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: ensure_rls; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
         WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
   EXECUTE FUNCTION public.rls_auto_enable();


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict lOxKdgHyOIe9RbLl59I20RdfKv8UaEqoaP3buimd5ZDN7dMwuUcuNkl3H6ltJsr

