# Reviewer photos

Two kinds of file live here. Both are optional: every slot falls back to an
initials disc in the brand gradient, so nothing breaks while the folder is
empty.

## Hero pill

`stack-1.jpg` … `stack-4.jpg`

The overlapping faces under the hero CTA, drawn at 34px and cropped to a circle.

## Review cards

`<name>.jpg`, where `<name>` is the reviewer's name lowercased with every run of
non-alphanumeric characters collapsed to a single hyphen. "Emma Taylor" reads
`emma-taylor.jpg`. Drawn at 40px.

The slug is produced by `avatarSlug()` in `components/ReviewAvatar.tsx`.

Adding a file is not enough on its own: the slug also has to be listed in
`lib/avatars.ts`. Names missing from that list draw the initials disc without
requesting anything, which is what keeps a page of reviews from firing one 404
per reviewer who has no photo. Most of them are meant to have none.
