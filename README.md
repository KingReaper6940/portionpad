# Portionpad

**A little more. A little less.**

A local ingredient quantity planner with exact fractions. Scale by servings or by one ingredient you have on hand, keep exceptions visible, and review the difference introduced by optional rounding.

## What it does

- Scale from original to target servings, including fractions.
- Use an on-hand ingredient amount as the scale anchor.
- Choose **Scale**, **Hold**, or **Manual** for each row.
- Calculate with reduced BigInt rational numbers rather than binary floating point.
- Keep exact amounts beside optionally rounded amounts and their exact differences.
- Highlight nonzero quantities that would round to zero.
- Save/reopen editable JSON projects; export plain text, CSV, and calculation JSON.
- Inspect reports before downloading. No accounts, uploads, analytics, or app storage.

## Run locally

Node.js 20 or newer. No dependencies to install.

```sh
git clone https://github.com/KingReaper6940/portionpad.git
cd portionpad
npm test
npm run build
npm run dev
```

Open http://127.0.0.1:4185. The local server binds to loopback and serves only allowlisted build assets.

## Use

1. Enter the original ingredient amounts, unit labels, and servings.
2. Set target servings, or select **An ingredient on hand** and enter its available amount **in the same unit as the original**.
3. Review each ingredient's policy. Scale follows the ratio; Hold keeps its original amount; Manual leaves the calculation blank for your decision.
4. Keep exact results or select a measuring increment. Differences are shown minus exact, in the row's original unit. Halfway values round up.
5. Save a project to keep editable inputs. To reopen it, paste its JSON under **Reopen a saved project**.
6. Choose an export, inspect it, then download.

Changing inputs updates the result. Invalid input hides the result, clears the export preview, and disables saving/downloading. A rejected project import leaves your existing plan intact. Removing a row resets scaling to servings and the first anchor to avoid silently reusing a different ingredient.

## Examples and method

The bundled fictional quantity list is **not a tested recipe**.

At four original servings and six target servings, the ratio is exactly 3/2. The example's 250 g flour becomes 375 g, and 1 1/3 cups milk becomes 2 cups. Its held oil remains 1 tbsp; its manual seasoning is left for review.

Anchoring that same flour row to 350 g gives a ratio of 7/5 and a proportional yield of 5 3/5 servings. This does not promise that the food will physically make that many portions.

At one target serving, the spice's exact result is 1/12 tsp. Whole-unit rounding would show 0 tsp with a difference of -1/12; the row is highlighted. The exact calculation remains available.

Regenerate the [editable project](examples/project.json), [JSON report](examples/report.json), [CSV table](examples/plan.csv), and [plain text plan](examples/plan.txt) with:

```sh
node scripts/example.mjs
```

## Limitations

- Quantity arithmetic only: no cooking-time, equipment, pan-capacity, ingredient-density, nutrition, substitution, or nonlinear cooking guidance.
- Units are unchanged text labels. A regional cup, gram, teaspoon, or egg is never automatically converted into another unit.
- Fractional eggs and other discrete items remain fractions; measuring/adjusting them is your decision.
- Original/target servings: greater than zero and at most 1,000. Scale factor: 1/1,000 through 1,000.
- Amounts: nonnegative, at most 1,000,000; decimals up to three places; fractions with denominators 1–1,000. Examples: `2`, `0.75`, `1/3`, `1 1/2`. No negative values, ranges, scientific notation, Unicode fraction symbols, or units embedded in amounts.
- 1–40 ingredient rows; project JSON up to 50,000 characters. Original quantity entry is bounded even when a scaled result is larger or has a more complex denominator.
- Rounding is applied to Scale rows only, with increments 1, 1/2, 1/4, 1/8, or 1/16 of that row's unit. It does not infer the best increment for an ingredient.
- Projects and reports contain ingredient names and notes. CSV quotes fields and prefixes formula-like values with an apostrophe; importing applications may display that prefix.
- Nothing is saved automatically. Browser memory, extensions, downloaded files, and the hosting environment remain outside the app's control.
- Native download destinations were not verified in browser automation. Report content and pasted project round trips were verified.

## Verification

`npm test` runs 15 tests, including 400 exact serving-ratio combinations, fraction parsing, bounds, zero/held anchors, manual exceptions, rounding deltas, project round trips, and CSV escaping. CI runs Node 22 and 24 on Windows and Linux.

Browser checks verified the anchor example, anchor-unit label changes, zero-rounding highlights, invalid-result clearing, saved-project reopening, and rejected imports preserving the current plan. At a 390px viewport the page is 375px wide, with the ingredient table contained in its own scroll region.

A real screenshot remains pending because the browser capture service timed out. No mockup is presented as a screenshot; visual screenshot review is not claimed.

## Deploy to Vercel

Import the GitHub repository using **Other**, root directory `.`, build command `npm run build`, output `dist`, and an empty install command. The settings are included in `vercel.json`. No environment variables, database, server functions, or paid API are required. Other static hosts work if they serve `.mjs` files as JavaScript.

## Related approaches

An older [Baking community question](https://www.reddit.com/r/Baking/comments/ln97ln/what_do_you_douse_to_scaleresize_recipes/) describes scaling around leftover ingredients and spreadsheets. [Awesome Cuisine](https://www.awesomecuisine.com/food-calculators/recipe-scaling-calculator/) already offers fraction inputs, rounding, and scaling policies; [siutil](https://siutil.com/recipe-scaler/) offers browser-local scaling and rounding. Portionpad focuses on inspectable exact ratios and explicit rounding differences. These references do not establish market demand or novelty.

MIT licensed. See [LICENSE](LICENSE).
