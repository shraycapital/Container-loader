# DrumFit calculation and packing audit

The previous search did not consider every arrangement. It sampled drum-size combinations and used greedy placement, and its free-space partitions could exclude physically empty space. The updated version improves this, but remains a heuristic rather than an exhaustive optimizer. A failed search is still not proof that the load cannot fit.

## Changes implemented

| Finding | Practical effect | Change |
|---|---|---|
| Free space was divided into non-overlapping rectangles after every placement | A later drum could fit across the artificial dividing line but never be tried there | Added four maximal-free-rectangle placement strategies. These retain overlapping *alternative free spaces*, remove occupied space from every alternative, and check spacing. The actual drums never overlap. Earlier shelf and split strategies remain available to the search. |
| Only 420 size combinations were sampled | Individually attractive drum sizes can produce a poor combined layout | Added Thorough search: 900 combinations followed by two rounds of per-item size refinement within the best combined plan. Balanced search still uses 420 combinations. Neither is exhaustive. |
| All cable varieties shared one barrel rule | A cable-specific minimum could not be represented | Each cable row now accepts a minimum barrel diameter override in mm. A blank field uses the global formula. The override replaces that formula for the item and is rounded upward to the size increment. It is also saved in the cable library. |
| The volume estimate was described as checking whole layers, but did not compute whole turns and layers | Narrow/shallow drums could be accepted even when the required length exceeds a square-wound, whole-turn estimate | Added a conservative capacity mode that takes the lower of the formula and the full-turn/full-layer estimate. The diagnostics table and export show both. Formula-only mode remains available for a validated manufacturer model. |
| The floor corridor used the door's width but was aligned with the container's side wall | With little or no side clearance, a placement could be outside the centred doorway's straight-entry corridor | Shifted the corridor by half the difference between internal and door widths. The model assumes a centred door; unusual containers need a different doorway model. |
| Drum dimensions were only in mm | Difficult to compare with inch-based supplier specifications | Flange, barrel, clear width, outside width and stack height now show mm and inches. CSV includes numeric inch columns for the four drum dimensions. Conversion uses exactly 25.4 mm/in; inch display does not change the manufacturing grid. |

## Calculation review

The default annular-volume formula is dimensionally correct:

`L(m) = k × W × ((F − 2c)² − B²) / (1000 × od²)`

The π/4 factor cancels when annular volume is divided by cable cross-sectional area. Do not add another π/4 to this expression. The 1000 converts the resulting length in mm to metres. The formula assumes a round cable, clear winding width, radial freeboard on both sides of the wound diameter, and a suitable volume-packing factor.

The new independent square-winding check uses:

```
T = floor(W / od)                         turns per full layer
N = floor((F − 2c − B) / (2 × od))        complete radial layers
Lsquare(m) = π × T × N × (B + N × od) / 1000
Capacity used = min(formula result, Lsquare)
```

This adds the circumferences at the cable centreline for all complete layers. It is a conservative simplified model, not a universal physical upper bound. It excludes partial layers, hexagonal nesting, helical corrections, winding crossovers, deformation and production allowances. A validated formula can legitimately differ, so formula-only mode remains available. The packing factor is not applied a second time to the independent square-winding estimate.

Regression example: OD 100 mm, barrel 200 mm, clear width 190 mm, flange 400 mm, zero freeboard, packing factor 0.70. The volume formula returns **1.596 m**, but one whole turn in one whole layer gives **0.942 m**. The conservative mode rejects a 1.1 m requirement on that fixed drum, which formula-only mode accepts.

Other checks already handled correctly: outside width includes two flange thicknesses plus total axial protrusion; reserve increases required capacity; the flange diameter includes radial freeboard; stacking includes one spacer between adjacent drums; per-drum cable length is multiplied by quantity for weight. Empty-drum weight remains a user-supplied value and must be revised when the proposed dimensions change.

The drum-rule panel also enforces an editable traverse proportion: `clear width W ≤ ratio × flange diameter F`. The default ratio is `1.5`. Because both dimensions follow the manufacturing grid, the search rounds the minimum required flange diameter upward before checking capacity and container fit.

No actual manufacturer capacity formula or cable-specific bend rules have been supplied yet. The default barrel multiplier of 20 and packing factor of 0.70 remain placeholders. A minimum bend radius cannot be substituted directly as a minimum barrel diameter. The exact conversion also depends on whether the radius is defined at the cable centreline or inner surface.

## Remaining ways to pack more, and how to implement them

| Method not yet implemented | Potential benefit | Information and implementation needed |
|---|---|---|
| Staggered circular packing for flat drums | Uses the gaps between circles that the current square envelopes reserve | Confirm flat transport is allowed; model actual circular or shaped spacer/base footprints. Use circle-to-circle clearance checks and tangent/offset row candidates. For equal diameters D and edge gap g, ideal triangular spacing is D+g across and √3/2 × (D+g) between staggered rows, subject to walls and loading access. Square support boards can eliminate this benefit. |
| Smaller drums stacked above larger drums, or different cable items sharing a stack | Uses otherwise unused height and leftover quantities | Add drum/support bearing surfaces, lower-drum load limits, upper masses, minimum support coverage and a stacking compatibility matrix. Then search a support graph in 3D. Simply checking bounding boxes is insufficient for circular flanges and cradles. |
| Flange interleaving / axial staggering of on-edge drums | Reduces gaps between adjacent reel envelopes | Obtain maximum wound-cable diameter, flange thickness, hub protrusions, side clearance and support footprints. Model the reel as multiple coaxial cylinders and test component-level collisions. Avoid flange-to-cable contact and check a feasible insertion path. |
| Diagonal floor angles other than 0°/90° | Can help awkward residual pockets | Add oriented-box or actual cylinder collision tests, a small angle sweep, and doorway/turning-path checks. Reduced static footprint in one direction can increase the other direction and may prevent loading. |
| Build stacks inside the container instead of passing complete stacks through the door | Uses height above the door header | Check every drum individually through the door, final stacks against internal height, and simulate lifting/assembly space. Needs loading equipment reach, mast/boom envelope, lifting clearance and sequence. Current whole-stack door limit is intentionally conservative. |
| Move drums sideways after entry to use the full internal width | Recovers strips beside a narrower door corridor | Separate final-position constraints from entry constraints and search collision-free translations/rotations. Reserve handling clearance and securing access. Current placements use a straight-entry corridor. |
| Different drum sizes for the same cable item | Improves fit for awkward remainder quantities | Split the item into two rows today, preserving the total quantity and length per drum. A future automatic version can partition quantities into two or three size groups and add a penalty for extra manufacturing variants. |
| Exact or near-exact optimization | More confidence that a better layout was not missed | Discretize allowed manufactured drum sizes and orientations, encode non-overlap, capacity, support and loading constraints in a constraint solver, and report an optimality bound or time-limit gap. Continuous, arbitrary sizes and fully general 3D loading greatly increase complexity. |

These methods should be introduced separately with focused geometry and loading tests, not enabled together by assuming every empty 3D space is usable.

## Manufacturer guidance affecting practical use

Prysmian's general [Cables and Drums User Guide](https://tr.prysmian.com/en/media/technical-article/cables-and-drums-user-guide) specifies upright handling and transport, and explains flange support and securing. Therefore flat-on-flange plans in this calculator are conditional engineering explorations, not generally approved transport arrangements. Obtain instructions for the specific drum/cable design before using those modes. A spacer alone does not establish allowable stacking load.

[Eland's drum dimensions guide](https://www.elandcables.com/the-cable-lab/faqs/faq-what-are-standard-cable-drums-weights-and-dimensions) distinguishes flange diameter, core diameter, overall width and inside width, and publishes varying nominal drum weights. This supports keeping winding width separate from transport width and rechecking drum weight for the selected construction.

## Verification

`node test.cjs` verifies the existing solver, mixed stacking, rotation, placement geometry, capacity, cable-library persistence and 3D rendering calculations. Audit regressions cover the shallow-drum capacity example, per-cable barrel overrides and rounding, inch conversion, centred doorway alignment, preservation of free space across partitions, clearance of maximal-rectangle placements, and Thorough search retaining or improving the Balanced result for the sample.

Browser interaction testing was not rerun for this audit. The application remains a single offline HTML file with no added dependencies.
