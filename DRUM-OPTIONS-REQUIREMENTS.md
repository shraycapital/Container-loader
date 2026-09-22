# Flexible drum inputs and available inventory

Status: requested feature specification; this document does not implement the controls below.

## Goal

Let each cable item fix any known drum dimensions and calculate the others, then evaluate the resulting drum choices together with container loading. The original planning case is a 20 ft standard container with a 20,000 kg cargo limit including drums and packing. Container dimensions and limits remain editable.

## Per-item dimension controls

Apply these modes independently to flange outside diameter, barrel diameter and clear winding traverse:

| Mode | Input | Required behavior |
| --- | --- | --- |
| Fixed | One value | Preserve exactly; never silently change it |
| Allowed options | Explicit list | Select only from the list |
| Range | Minimum, maximum, increment | Enumerate permitted values |
| Calculate | Manufacturing rules | Search within those rules |

Support fully specified existing drums, flange-only input, traverse-only input, flange plus barrel input, and fully flexible designs. Units must be explicit, with consistent internal conversion. Fixed dimensions must not be silently rounded onto a manufacturing grid.

## Cable requirements

Record cable ID, outside diameter, weight per unit length, required length per drum, quantity, manufacturer minimum winding barrel diameter, and whether splitting the required length is permitted. Each item has its own dimension modes and a source choice: available drums only, new/custom drums only, or either.

## Available drums

Record drum ID, flange diameter, barrel diameter, clear traverse, flange thickness, overall outside width including protrusions, empty weight, maximum loaded weight and available quantity. Allocate inventory across all cable items without double-counting. Fully specified inventory dimensions remain unchanged unless modification is explicitly allowed.

## Manufacturing and loading rules

- Permitted flange sizes, including the user's 35–60 inch sizes once their meaning is confirmed.
- Minimum barrel diameter by flange size, plus cable-specific winding requirements. Enforce both applicable minima.
- Traverse and barrel limits, manufacturing increments, flange thickness, axial protrusions and radial winding clearance.
- Validated winding capacity model and packing factor; distinguish estimated capacity from actual winding evidence.
- Empty-drum weight lookup or dimension-dependent model for custom designs; missing weights leave payload unverified.
- Allowed orientations, stacking limits, support allowances, clearances and packing weights.
- Actual container internal and door dimensions, payload and any supplied floor/load-distribution limits.

## Selection and results

Generate feasible drum candidates for each cable item before searching their combined loading arrangements. Every selected candidate must meet cable capacity, dimension, inventory and loaded-weight constraints. A layout must respect container boundaries, permitted orientations, spacing and stacking rules.

Show selected dimensions, fixed versus calculated values, capacity, loaded weight, inventory allocation and numbered container placements. Report missing inputs and conflicts specifically. Suggestions to relax fixed inputs must be separate from the submitted plan. A heuristic search failure must not be described as proof that no arrangement exists.

Preserve all new modes, values, option lists and inventory quantities in browser saves and portable data files. Restore older files with explicit backward-compatible defaults.

## Acceptance examples

1. A fixed flange and barrel produce a feasible traverse without changing either diameter.
2. A fixed traverse produces a flange from the allowed list while satisfying the size-dependent barrel minimum.
3. A fully specified drum with insufficient cable capacity is rejected with the capacity conflict shown.
4. Two cable items competing for the same stock cannot exceed its available quantity.
5. Available-only items cannot silently receive custom drums.
6. A geometrically feasible plan exceeding 20,000 kg is reported as overweight; missing weights cannot produce a verified payload pass.
7. Saving and reloading preserves dimension modes and inventory allocations' source inputs.

## Questions still open

- Confirm that nominal 35–60 inch sizes mean flange outside diameter.
- Confirm that traverse means clear width between flanges.
- May existing drums be modified, or must recorded dimensions remain fixed?
- Is the objective to fit a fixed order, maximize shipped cable, or minimize container count?
- Supply actual drum inventory, size-dependent barrel rules, representative cable orders and permitted splitting/stacking rules.
