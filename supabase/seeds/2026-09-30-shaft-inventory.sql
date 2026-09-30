-- Golf Liquidation: shaft inventory (run in Supabase SQL Editor)
-- Safe to re-run: uses SKUs with ON CONFLICT if you add a unique index on sku.

alter table public.inventory_items
  add column if not exists quantity integer not null default 1;

create unique index if not exists inventory_items_sku_key
  on public.inventory_items (sku)
  where sku is not null;

insert into public.inventory_items (
  sku,
  title,
  description,
  category,
  condition,
  brand,
  source_type,
  status,
  quantity,
  price_cents,
  notes
)
values
  (
    'SHAFT-VENTUS-TR-7X-2026',
    '2026 Fujikura Ventus TR VeloCore+ 7X Uncut',
    'New. Fujikura Ventus TR with VeloCore+. 7X flex, uncut length.',
    'accessories',
    'new',
    'Fujikura',
    'wholesaler',
    'in_stock',
    3,
    0,
    'Batch added 2026-09-30. Three shafts on hand.'
  ),
  (
    'SHAFT-VENTUS-TR-6X-2026',
    '2026 Fujikura Ventus TR VeloCore+ 6X Uncut',
    'New. Fujikura Ventus TR with VeloCore+. 6X flex, uncut length.',
    'accessories',
    'new',
    'Fujikura',
    'wholesaler',
    'in_stock',
    7,
    0,
    'Batch added 2026-09-30. Seven shafts on hand.'
  ),
  (
    'SHAFT-KBS-130X-4PW-HALFOVER',
    'KBS 130X 1/2" Over, 4-PW Shaft Set',
    'New KBS 130X (130g) iron shafts, half inch over length. 4 iron through pitching wedge (7 shafts).',
    'accessories',
    'new',
    'KBS',
    'wholesaler',
    'in_stock',
    1,
    0,
    'Single complete matching set.'
  )
on conflict (sku) where sku is not null do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  condition = excluded.condition,
  brand = excluded.brand,
  source_type = excluded.source_type,
  status = excluded.status,
  quantity = excluded.quantity,
  notes = excluded.notes,
  updated_at = now();

-- Unit cost (per shaft), not per lot
update public.inventory_items
set cost_cents = 5000
where sku in ('SHAFT-VENTUS-TR-7X-2026', 'SHAFT-VENTUS-TR-6X-2026')
  and cost_cents is null;

update public.inventory_items set slug = 'ventus-tr-7x-2026-uncut'
where sku = 'SHAFT-VENTUS-TR-7X-2026' and slug is null;
update public.inventory_items set slug = 'ventus-tr-6x-2026-uncut'
where sku = 'SHAFT-VENTUS-TR-6X-2026' and slug is null;
update public.inventory_items set slug = 'kbs-130x-4pw-half-over'
where sku = 'SHAFT-KBS-130X-4PW-HALFOVER' and slug is null;
