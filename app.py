import streamlit as st
import streamlit.components.v1 as components
from pathlib import Path

st.set_page_config(page_title="Online Quiz System", layout="wide")

html_file = Path("index.html")
css_file = Path("style.css")
js_file = Path("script.js")

html = html_file.read_text(encoding="utf-8")
css = css_file.read_text(encoding="utf-8")
js = js_file.read_text(encoding="utf-8")

html = html.replace(
    '<link rel="stylesheet" href="style.css" />',
    f"<style>{css}</style>"
)

html = html.replace(
    '<script src="script.js"></script>',
    f"<script>{js}</script>"
)

components.html(html, height=1000, scrolling=True)