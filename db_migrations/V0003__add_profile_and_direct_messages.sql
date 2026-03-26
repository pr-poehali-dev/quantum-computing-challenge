ALTER TABLE t_p24415767_quantum_computing_ch.users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;
ALTER TABLE t_p24415767_quantum_computing_ch.users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;

CREATE TABLE IF NOT EXISTS t_p24415767_quantum_computing_ch.direct_messages (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);