-- Storage deletes and upserts read the object first; without a select policy they silently match nothing.
create policy "media: owner select" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
