---
title: FIFA World Cup predictor, an ML forecasting and Monte Carlo simulation engine
tools: [Python, scikit-learn, pandas, Jupyter, Streamlit]
links:
  - label: GitHub
    href: https://github.com/rayhanrinzan/fifa-world-cup-predictor
  - label: Demo
    href: https://fifawcpredictor.streamlit.app/
order: 1
---

It turns historical international football results into match predictions and tournament forecasts. The hard part was draws. My first models reached about 53% accuracy by never predicting one: zero draws called across 8,155 test matches. So I stopped scoring on accuracy, trained with class-balanced weights, and judged every model by macro F1 on a chronological split, where ignoring an outcome costs a third of the score. Adding leakage-safe Elo ratings then lifted macro F1 about 18%, from a 0.445 baseline to 0.526, with a model that predicts all three outcomes. Knockout games can't end level, so the bracket simulator splits each draw probability between the two teams before a Streamlit app runs 10,000 Monte Carlo tournaments to estimate every team's chance of reaching each round.
