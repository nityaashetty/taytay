from flask import Flask, render_template, request
from short import search_long_to_short, search_short_to_long

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/search", methods=["POST"])
def search():
    user_input = request.form["user_input"].strip()
    choice = request.form["choice"]

    if not user_input:
        return render_template("results.html", results=[], query="(empty)", choice=choice)

    if choice == "long":
        results = search_long_to_short(user_input)
    else:
        results = search_short_to_long(user_input)

    return render_template("results.html", results=results, query=user_input, choice=choice)

if __name__ == "__main__":
    app.run(debug=True)
