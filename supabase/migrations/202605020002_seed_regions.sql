insert into regions (name, slug, display_name, city, province)
values
  ('Jogja', 'jogja', 'Jogja Hub', 'Yogyakarta', 'DI Yogyakarta'),
  ('Surabaya', 'surabaya', 'Surabaya Hub', 'Surabaya', 'Jawa Timur'),
  ('Bali', 'bali', 'Bali Hub', 'Denpasar', 'Bali'),
  ('Lombok', 'lombok', 'Lombok Hub', 'Mataram', 'Nusa Tenggara Barat'),
  ('Labuan Bajo', 'labuan-bajo', 'Labuan Bajo Hub', 'Labuan Bajo', 'Nusa Tenggara Timur')
on conflict (slug) do nothing;
