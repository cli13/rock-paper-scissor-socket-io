function logout() {
  var form = document.createElement("form");
  form.action = "/logout";
  form.method = "post";
  var sbmt = document.createElement("input");
  sbmt.name = "logout-submit";
  form.appendChild(sbmt);
  document.body.appendChild(form);
  form.submit();
}