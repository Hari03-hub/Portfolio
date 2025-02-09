from flask import Flask, render_template, request

app = Flask(__name__)

# Stress-indicating words list
stress_indicating_words = ["stressed", "anxious", "overwhelmed", "worried", "nervous"]

def analyze_stress(text):
    # Check for stress words in the input text
    detected_words = [word for word in stress_indicating_words if word in text.lower()]
    return {
        "text": text,
        "stress_detected": bool(detected_words),
        "stress_words": detected_words
    }

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/detect", methods=["POST"])
def detect():
    text = request.form.get("text")
    result = analyze_stress(text)
    return render_template("index.html", result=result)

if __name__ == "__main__":
    app.run(debug=True)
