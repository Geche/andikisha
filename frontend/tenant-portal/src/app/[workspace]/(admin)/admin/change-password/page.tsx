// Admin-shell change-password. Renders the same change-password form as
// /my/change-password, but inside the (admin) layout so admin-tier users keep
// their navigation context instead of being dropped into the employee shell
// (FE-BACKLOG-014). The form body is role-aware (its back-link resolves to the
// caller's shell), so the single implementation serves both routes. When the
// "My HR" self-service section is built, this promotes cleanly to a shared
// component; until then, reusing the existing page avoids a speculative
// abstraction.
export { default } from "../../../(my)/my/change-password/page";
