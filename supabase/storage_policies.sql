-- Permite a usuarios autenticados subir, leer, actualizar y borrar archivos
-- en el bucket "Manuales" (manuales técnicos en PDF)

drop policy if exists "authenticated can see manuales bucket" on storage.buckets;
drop policy if exists "public can see manuales bucket" on storage.buckets;
drop policy if exists "authenticated can read manuales" on storage.objects;
drop policy if exists "authenticated can upload manuales" on storage.objects;
drop policy if exists "authenticated can update manuales" on storage.objects;
drop policy if exists "authenticated can delete manuales" on storage.objects;
drop policy if exists "public can read manuales" on storage.objects;

create policy "authenticated can see manuales bucket"
on storage.buckets for select
to authenticated
using (id = 'Manuales');

create policy "public can see manuales bucket"
on storage.buckets for select
to anon
using (id = 'Manuales');

create policy "authenticated can read manuales"
on storage.objects for select
to authenticated
using (bucket_id = 'Manuales');

create policy "authenticated can upload manuales"
on storage.objects for insert
to authenticated
with check (bucket_id = 'Manuales');

create policy "authenticated can update manuales"
on storage.objects for update
to authenticated
using (bucket_id = 'Manuales');

create policy "authenticated can delete manuales"
on storage.objects for delete
to authenticated
using (bucket_id = 'Manuales');

create policy "public can read manuales"
on storage.objects for select
to anon
using (bucket_id = 'Manuales');
