---
title: FIFA World Cup predictor
tools: [Python, scikit-learn, pandas, Jupyter, Streamlit]
links:
  - label: GitHub
    href: https://github.com/rayhanrinzan/fifa-world-cup-predictor
  - label: Demo
    href: https://fifawcpredictor.streamlit.app/
order: 1
---

It turns historical international football results into match predictions and tournament forecasts. The hard part was keeping the features honest: recent form and Elo ratings are built without leaking future results, and logistic regression and ensemble classifiers are compared on a chronological split. Macro F1 improved about 18% from a 0.445 baseline. A Streamlit app runs 10,000 Monte Carlo tournaments to estimate each team's chance of winning and of reaching each round.
