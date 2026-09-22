# DrumFit

[Open the public DrumFit calculator](https://shraycapital.github.io/Container-loader/)

Open `index.html` in any modern browser. It is a self-contained, offline calculator; no installation or server is needed.

## Published website password

GitHub Pages publishes only an encrypted wrapper, built by `.github/workflows/pages.yml`. The password is stored in the repository Actions secret `DRUMFIT_SITE_PASSWORD`; it must not be committed. The build fails if that secret is absent. To change the password, update the secret and rerun **Publish locked DrumFit**.

The published planner decrypts locally with PBKDF2-SHA256 (600,000 iterations) and AES-256-GCM. Incorrect passwords cannot decrypt the app. Refreshing asks for the password again; the password is not saved by the app. Existing browser-stored cable data remains at the same website origin. This is a static website lock, not server authentication: the source repository remains public, short passwords can be guessed offline, and browser-local data is not encrypted by this lock. No confidential data should be embedded in the public source.

For a local deployment build, set `DRUMFIT_SITE_PASSWORD` in the environment and run `node build-locked.cjs`. Output is `_site/index.html`; publish only `_site`, never the source directory. `node test-lock.cjs` tests encryption and password rejection.

## Fix dimensions or use available drums

Click **Choose drum** beside a cable name. The chooser starts with three clear options: **Find a drum size**, **I know some dimensions**, and **Use available drums**. For known dimensions, leave a box blank to calculate it, enter one size to fix it, or enter a list such as `35, 40, 48, 60`. Each box has its own millimetres/inches selector. **Use a size range instead** reveals separate minimum, maximum and step fields. **Use this choice** applies the settings; Cancel or Escape leaves the previous choice unchanged. A summary stays visible beside the cable name.

**Use available drums** provides a dropdown with stock IDs, flange sizes and available quantities, plus a preview of the selected drum. Leave the dropdown on automatic to search all stock. **Also allow a new custom drum** enables the previous Either behavior. Optional size requirements remain available and existing saved constraints are preserved. The inventory link takes you directly to the available-drum table; unapplied chooser edits are discarded. Fixed values remain exact. Calculated barrel diameter uses the smallest permitted diameter; use a list or range to try larger barrels. All choices still respect capacity, minimum barrel, shared width/flange limits and loading constraints.

Under **Available drums & flange-specific barrel rules**, add stock IDs with complete dimensions, flange thickness, available quantity and optional empty/maximum loaded weights. Outside width must include the clear traverse, both flanges and any protrusions. Select **Available drums only**, **New / custom only**, or **Either** on each cable item. An optional stock ID restricts the stock choices. Available stock must also match the item's dimension settings. Stock is shared across cable rows and cannot be allocated beyond the entered quantity. Each cable row uses one drum type; split an item into separate rows to use multiple stock types. Inventory quantities are planning inputs, not permanently decremented by calculation.

Flange-specific minimum barrel rules apply at the exact flange sizes entered. The larger of the flange rule and the cable minimum is enforced; unlisted flange sizes use the cable minimum only. Fixed values that conflict with these rules yield no compatible drum rather than being silently changed.

Results show selected stock IDs or dimension modes. **Drum source & weight checks** shows stock reservations and stock loaded-weight checks. Stock empty weights replace the cable row's custom-drum weight. Blank weights remain unverified; known weight above a limit is rejected/reported even if another weight is missing. Custom-drum empty weight remains a user-supplied value that must be checked for the selected dimensions. The search favours more drums placed, then lower known payload excess, then shorter floor length and smaller footprint; it is a heuristic and cannot certify an optimum or impossibility.

These settings, inventory and flange rules are included in browser autosave and portable JSON backups. Older backups default to calculated dimensions and custom drums. The 20 ft preset now uses the requested **20,000 kg planning payload limit**, rather than the carrier example's rated payload; saved plans retain their existing entered limit.

Run `node test.cjs` and `node test-options.cjs` for the calculation and persistence checks.

1. Select a 20 ft standard, 40 ft standard, 40 ft high cube, or 45 ft high cube dry container, or enter custom internal and door dimensions. Presets fill all six container measurements and payload fields; editing one switches the selection to Custom. Your cable list and drum rules stay in place.
2. Enter each cable's OD in millimetres, length **per drum** in metres, and quantity of drums. Optional weights enable the payload check.
3. Open **Drum rules & cable-capacity formula** and enter your manufacturer's rules.
4. Select **Find my drum sizes**. The result gives flange diameter, barrel diameter, clear winding width, outside width and capacity for each item, plus a top-view layout.
5. Export the sizes and placement coordinates to CSV, or print the plan.

## 3D loading view

After calculation, an interactive **3D loading model** appears below the top view. Drag to rotate or use the Rotation, Elevation and Zoom sliders. Isometric, From doors, Side and Top buttons reset the camera to useful views. The model shows every placed drum at its calculated coordinates and level, with its actual flange/barrel orientation. Stack numbers match the plan table. Partial layouts show only placed drums.

Drum geometry uses flange diameter, barrel diameter, clear width and flange thickness. Cable winding and axial protrusions are omitted from the drawing, while placement still reserves their outside envelope. Tan boxes represent spacer allowances and grey boxes represent base allowances; they are not support-design drawings. The container is an open wireframe so its contents remain visible, with the door opening outlined in green. This is a schematic 3D view rather than a CAD or structural model. It works offline without downloaded libraries and is included when printing the plan. Changing view controls does not change the calculation; changing planning inputs clears the model until recalculation.

Valid inputs are automatically saved locally when browser storage is available, and can also be saved immediately with **Save in this browser now**. This survives closing and reopening the same browser at the same address. The example is illustrative, not actual cable data.

For durable and portable persistence, use **Save all data file**. The downloaded JSON file contains the complete cable library, current cable rows, container and drum rules, formulas, stacking choices and search settings. **Load data file** validates and restores that backup, then saves it into the current browser. This avoids losing data when the browser profile, localhost address or computer changes. Keep the JSON file in your normal backed-up documents location; the HTML calculator cannot silently choose or maintain files elsewhere on the computer.

## Stacking and saved cables

Choose the loading mode under **Stacking & orientation**:

- **Smart mixed · all stacking methods** chooses on-edge or flat-on-flange independently for each stack. Different stacks of the same cable item may use different arrangements while retaining one common drum size.
- **On flange edges · single layer** keeps the original arrangement.
- **On flange edges · vertical stacks** uses flange diameter as drum height and requires suitable cradles/supports.
- **Flat on flange · vertical stacks** uses outside drum width as height and flange diameter in both floor directions. Choose this only if flange-down transport is permitted for your cable/drum.

Set maximum drums per stack and spacer thickness. Each stack contains identical drums of one cable item. Stack height is `base + drum count × drum height + (drum count − 1) × spacer thickness`. The entire stack must fit below both the door and inside height. Spacer/support footprints must fit inside the drum footprint; enter their total weight in **Packing + all spacers weight**. The planner checks geometry, not support strength, flange loading, or stability.

Under **On-edge floor orientation**, choose **Automatic · try both directions** to let the planner mix drums with flanges facing the doors and drums with flanges facing the side walls. The two fixed options restrict this direction when needed. Smart mixed with automatic orientation explores all three postures/directions at each available floor position. The diagram draws flat flanges as circles and on-edge flanges as pairs of lines. The stack table and CSV identify the actual arrangement of every stack. Existing saved plans retain their loading-mode selection; choose Smart mixed to enable the expanded search.

The plan labels floor positions with stack numbers and drum counts. A stack table gives total heights and spacer counts. CSV export includes each drum's stack, level and height above the floor.

Use **Save** beside a cable row to store the name, OD, default length and optional weights. Choose it in **Saved cable library**, then click **Add saved cable**. It adds a new row with quantity 1. Saving a matching name (case-insensitive) updates that entry. Recheck the saved empty-drum weight against the proposed drum dimensions.

The library is stored on this device in the same browser and origin, separately from the last plan. Reopening the same URL retains it; clearing browser data removes it. It is not shared between browsers, devices, different server ports or file URLs. The JSON data file is the portable copy across those boundaries. Storage and import failures are reported instead of claiming the data was saved.

## Default calculation

The initial barrel rule is `B = m × od`, rounded upwards to the selected size step. The initial multiplier of 20 is a placeholder, not a universal cable requirement. A specified minimum bend radius is not a barrel diameter: use the manufacturer's conversion.

Each cable row now has an optional **Min barrel Ø** override in mm, replacing the global rule for that item. Suggested drum dimensions and stack heights display both mm and decimal inches; export includes numeric drum-size inch columns. Inch values are conversions, not a second manufacturing size grid.

The default capacity estimate in metres is:

```
L = k × W × ((F − 2c)² − B²) / (1000 × od²)
```

`F` is flange diameter, `B` is barrel diameter, `W` is clear winding width, `c` is radial clearance from the wound cable to the flange edge, and `od` is cable diameter, all in mm. `k` is the cable packing factor (initially 0.70). This is the usable annular winding volume divided by cable cross-sectional area, with conversion from mm to metres. It is an approximate volume model, not an exact count of turns and layers.

Both formulas are editable. Expressions support arithmetic, parentheses, exponentiation with `^`, and `pi`. The capacity formula must return metres. The barrel formula must return mm. Formula input does not execute JavaScript.

The default **Capacity check** now takes the lower of that formula and a conservative whole-turn/whole-layer square-winding estimate. Choose **Use my formula only** for a validated model that includes its own winding assumptions. Expand **Capacity checks & packing limits** in the results to compare both estimates. See [the calculation and packing audit](PACKING-AUDIT.md) for the derivation, a regression example and remaining packing methods.

Outside width is `W + 2 × flange thickness + total axial protrusion`. Requested capacity is the entered length multiplied by `1 + reserve / 100`. Reserve is capacity headroom, not extra cable loaded; weight uses the entered cable length.

The editable **Maximum clear width ÷ flange Ø** rule limits the winding traverse for every drum. Its default is `1.5`, so each candidate must satisfy `W ≤ 1.5 × F`. The search raises the flange diameter when necessary; if that exceeds the flange, container, or door limits, the candidate is rejected. The selected ratio is saved with the plan and exported to CSV.

## Search and interpretation

The calculator enumerates clear widths and flange diameters in the chosen manufacturing increment (25 mm initially). For each width it keeps the smallest flange meeting the capacity rule and allowed orientation constraints. Balanced search tries 420 size combinations; Thorough tries 900 plus two rounds of combined-layout size refinement. Fixed-direction modes try four maximal-free-rectangle strategies and four shelf orders. Mixed or automatic-direction modes try four split-rectangle strategies, four maximal-free-rectangle strategies and two shelf orders. Each cable item uses one common drum size for its full quantity. It favours complete loading, then shorter occupied floor length, then smaller total placed stack footprint. This is a deterministic heuristic search, not proof of a globally optimal packing.

Loading-mode and floor-orientation controls define the permitted arrangements; in Smart mixed / Automatic these can vary between floor positions within the same container. Load stacks from the closed end toward the doors. Usable floor width conservatively uses the smaller of internal width and door width, less side clearance. Height includes the entered chock/dunnage and spacer allowances. Each individual stack keeps one cable item and orientation: mixed-item or mixed-orientation drums within a stack, flange interleaving and in-container assembly above door height are not searched. Flat drums use square bounding footprints; staggered circle packing is not searched. The model does not reserve additional handling equipment or turning space.

“Yes — a geometric fit was found” means the displayed arrangement passes the model's dimension and capacity checks. It does not establish drum structural suitability or a complete handling/securing design. “No complete layout found” is not mathematical proof of impossibility. “No drum size meets these constraints” means an item has no candidate on the selected size grid within the selected limits.

Missing cable or empty-drum weights leave payload unverified. Entered weight exceeding payload is reported even if other weights are missing. Include packing weight and recheck empty-drum weight against the proposed dimensions. Floor point loads, drum strength, axle limits, loading equipment, cable winding instructions and securing require separate verification.

The 20 ft preset comes from Hapag-Lloyd's published fleet example: https://www.hapag-lloyd.com/en/services-information/cargo-fleet/container/20-standard.html . Actual containers vary; all dimensions and payload are editable.

Additional presets use the dimension and weight tables from these Hapag-Lloyd fleet examples:

- [40 ft standard](https://www.hapag-lloyd.com/en/services-information/cargo-fleet/container/40-standard.html)
- [40 ft high cube](https://www.hapag-lloyd.com/en/services-information/cargo-fleet/container/40-standard-high-cube.html)
- [45 ft high cube](https://www.hapag-lloyd.com/en/services-information/cargo-fleet/container/45-standard-high-cube.html)

The maximum flange diameter under Drum rules remains a separate manufacturing constraint. Increase it if larger drums are permitted when using a high cube container.

## Verification

Run `node test.cjs` to check expression parsing, capacity arithmetic, minimum barrel rules, example loading, door and wall clearances, gaps, non-overlapping placement, impossible-size cases, both stacking modes, spacers and cable-library persistence. Additional fixtures verify a load that needs both flat and on-edge stacks, and a single cable item that needs both floor directions. Browser checks on the original version also covered the rendered example and excess-payload reporting.
