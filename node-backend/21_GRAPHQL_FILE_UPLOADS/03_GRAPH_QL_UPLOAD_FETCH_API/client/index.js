let file = null;

document.getElementById("picture").addEventListener("change", (e) => {
  file = e.target.files[0];
});

document.getElementById("button").addEventListener("click", async () => {
  const formData = new FormData();
  const map = `{"0":["variables.picture"]}`;
  const operations = `{"query":"mutation UploadFile($picture: Upload!){  uploadFile(picture: $picture)}"}`;
  formData.append("operations", operations);
  formData.append("map", map);
  formData.append("0", file);
  console.log({ file });

  const res = await fetch("http://localhost:3001/graphql", {
    body: formData,
    method: "post",
  });
  const data = res.json();
  console.log({ data });
});
