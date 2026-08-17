"""
NIRNAY – Nagpur Traffic Heatmap Generator
=========================================
Generates a premium, high-fidelity traffic heatmap from iRASTE 2024 survey data.
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Set premium dark style parameters
plt.style.use('dark_background')
plt.rcParams['font.sans-serif'] = 'Segoe UI'
plt.rcParams['font.family'] = 'sans-serif'

# 1. Load data
df = pd.read_csv("data6.csv")

# 2. Filter rows
# - data_status = "verified_survey"
# - exclude rows marked "location_only_verify_traffic" (which are already not "verified_survey")
filtered_df = df[df["data_status"] == "verified_survey"].copy()

# 3. Create Heatmap
fig, ax = plt.subplots(figsize=(10, 8), dpi=300)

# Extract coordinates and intensity weights
lats = filtered_df["latitude"].values
lons = filtered_df["longitude"].values
weights = filtered_df["traffic_weight"].values
locations = filtered_df["location"].values

# Create a beautiful smooth density visualization using a scatter with color mapping
# Colormap: Inferno / Magma / Plasma (rich dark gradients)
scatter = ax.scatter(
    lons, lats,
    c=weights,
    s=weights * 400 + 100,  # size proportional to intensity
    cmap='inferno',
    alpha=0.85,
    edgecolors='none'
)

# Draw subtle connection lines or halos to simulate heat flow/density
from scipy.interpolate import griddata
grid_x, grid_y = np.mgrid[min(lons)-0.01:max(lons)+0.01:200j, min(lats)-0.01:max(lats)+0.01:200j]
grid_z = griddata((lons, lats), weights, (grid_x, grid_y), method='cubic', fill_value=0)

# Plot soft background heat contours
contour = ax.contourf(
    grid_x, grid_y, grid_z,
    levels=15,
    cmap='inferno',
    alpha=0.3,
    antialiased=True
)

# Annotate key survey hubs to make it look premium and informative
for i, txt in enumerate(locations):
    # Only label important or highly weighted nodes to prevent clutter
    if weights[i] > 0.6:
        clean_txt = txt.split(',')[0].strip()
        ax.annotate(
            clean_txt,
            (lons[i] + 0.001, lats[i] + 0.001),
            color='#E2E8F0',
            fontsize=8,
            fontweight='semibold',
            alpha=0.9
        )

# Grid and styling
ax.grid(True, linestyle='--', color='#2D3748', alpha=0.5)
ax.set_facecolor('#0F172A')  # Dark slate background
fig.patch.set_facecolor('#0F172A')

# Colorbar matching color scheme
cbar = fig.colorbar(scatter, ax=ax, orientation='vertical', pad=0.03)
cbar.set_label('Traffic Weight Intensity (Normalized 0-1)', color='#94A3B8', fontsize=10, fontweight='bold')
cbar.ax.yaxis.set_tick_params(color='#94A3B8', labelcolor='#94A3B8')
cbar.outline.set_edgecolor('#334155')

# Title & labels
ax.set_title("Nagpur Traffic Heatmap (iRASTE 2024)", color='#F8FAFC', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel("Longitude (°E)", color='#94A3B8', fontsize=10, labelpad=8)
ax.set_ylabel("Latitude (°N)", color='#94A3B8', fontsize=10, labelpad=8)
ax.tick_params(axis='both', colors='#94A3B8')

# Set bounding frame colors
for spine in ax.spines.values():
    spine.set_color('#334155')

plt.tight_layout()

# Save image
output_path = "nagpur_traffic_heatmap.png"
plt.savefig(output_path, facecolor='#0F172A', edgecolor='none', dpi=300)
print(f"Heatmap generated successfully: {output_path}")
