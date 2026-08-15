# Reviewer photos

Two kinds of file live here. Both are optional: every slot falls back to an
initials disc in the brand gradient, so nothing breaks while the folder is
empty.

## Hero pill

`stack-1.jpg` … `stack-5.jpg`

The five overlapping faces under the hero CTA, drawn at 34px and cropped to a
circle. Square source images, 128×128 or larger, are what to aim for.

## Review cards

`<name>.jpg`, where `<name>` is the reviewer's name lowercased with every run of
non-alphanumeric characters collapsed to a single hyphen. "Emma Taylor" reads
`emma-taylor.jpg`. Drawn at 40px, so 96×96 or larger is plenty.

The slug is produced by `avatarSlug()` in `components/ReviewAvatar.tsx`.
