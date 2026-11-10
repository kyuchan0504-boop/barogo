import json, pathlib
root = pathlib.Path(__file__).parent
tpl = (root / "src/index.html").read_text()
data = (root / "build/data.json").read_text().replace("</", "<\\/")
app = "\n".join((root / f"src/app{i}.js").read_text() for i in (1, 2, 3)).replace("</script", "<\\/script")
out = tpl.replace("/*__DATA__*/", data).replace("/*__APP__*/", app)
(root / "build/index.html").write_text(out)
print("index.html", len(out) // 1024, "KB")
