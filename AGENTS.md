<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the user
> will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in the
> editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep offline/PWA behavior behind a single guarded client registration wrapper so browser previews never register service workers; this preserves a reliable editor preview while enabling offline use on published domains.
- Keep cached recipe ingredients in a shared serving-scaling utility so scan cards and detail views display consistent portions without mutating original generated recipe data.
