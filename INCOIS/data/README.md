# Local NetCDF Data Directory

Place your ocean model output `.nc` files here. The backend will automatically
discover and load them on startup.

## Supported Models & Conventions

The parser auto-detects CF-convention variable names from these models:

| Model    | Temperature | Salinity | U-current | V-current |
|----------|-------------|----------|-----------|-----------|
| CMEMS    | `thetao`    | `so`     | `uo`      | `vo`      |
| HYCOM    | `water_temp`| `water_salt` | `water_u` | `water_v` |
| ROMS     | `temp`      | `salt`   | `u`       | `v`       |
| MOM6     | `temperature` | `salinity` | `u`    | `v`       |

## Quick Start — Download a Sample Dataset

Using the Copernicus Marine toolbox:

```bash
pip install copernicusmarine
copernicusmarine login   # enter your credentials once

copernicusmarine subset \
  --dataset-id cmems_mod_glo_phy_anfc_0.083deg_P1D-m \
  --variable thetao --variable so \
  --start-datetime 2025-08-01T00:00:00 \
  --end-datetime 2025-08-01T23:59:59 \
  --minimum-longitude 64 --maximum-longitude 88 \
  --minimum-latitude 8 --maximum-latitude 24 \
  --minimum-depth 0 --maximum-depth 1100 \
  --output-filename indian_ocean_phy.nc \
  --output-directory ./data/
```

For currents (u, v components):

```bash
copernicusmarine subset \
  --dataset-id cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m \
  --variable uo --variable vo \
  --start-datetime 2025-08-01T00:00:00 \
  --end-datetime 2025-08-01T23:59:59 \
  --minimum-longitude 64 --maximum-longitude 88 \
  --minimum-latitude 8 --maximum-latitude 24 \
  --minimum-depth 0 --maximum-depth 1100 \
  --output-filename indian_ocean_currents.nc \
  --output-directory ./data/
```

## Environment Variable Override

Set `OCEAN_NETCDF_DIR` in `.env` to point to a different directory:

```
OCEAN_NETCDF_DIR=C:\path\to\your\netcdf\files
```
