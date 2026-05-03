create unique index if not exists idx_transactions_reference_id_unique
on transactions(reference_id)
where reference_id is not null;
