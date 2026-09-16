export function can(auth, module, action = "view") {
  if (!auth?.user) return false;
  if (auth.user.role === "super_admin") return true;
  return Boolean(auth.permissions?.[module]?.[action]);
}

export function visibleMenu(auth, module) {
  return can(auth, module, "view");
}
