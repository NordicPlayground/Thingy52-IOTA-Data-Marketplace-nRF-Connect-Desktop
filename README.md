# nRF Connect Thingy:52 IOTA Data Marketplace Publisher
*nRF Connect Thingy:52 IOTA Data Marketplace Publisher*
(nRF Connect IDMP) is a module built to collect sensor readings using
the *Nordic Thingy:52*, and publish these measurements to the
[IOTA Data Marketplace](https://data.iota.org/) (IDMP). The module
uses the [nRF52 Development Kit](https://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF52-DK)
to allow for Bluetooth Low Energy (BLE) communication with the
Thingy.

*nRF Connect Thingy:52* is implemented as an app for nRF Connect.

This project was developed by a group of students from NTNU as part of
their bachelor project.


# Installation
This module runs on top of nRF Connect for dektop; make sure this is
installed and running. The application can be downloaded from the
[nRF Connect product page](https://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF-Connect-for-desktop).

*nRF Connect* currently supports the following operating systems:

* Windows
* Ubuntu Linux 64-bit
* macOS


# Compiling from source
Since *nRF Connect* expects local apps in
`$HOME/.nrfconnect-apps/local` (Linux/macOS) or
`%USERPROFILE%/.nrfconnect-apps/local` (Windows) directory, make sure
the repository is cloned or linked there.


## Dependencies

To build this project the following tools must be installed.

* Node.js (>=6.9)
* npm (>=5.6.0)


## Compiling

Run the following command from the command line, standing in the root
folder of the repository:

    npm install

When the install is complete &mdash; build the application using:

    npm run build

The *nRF Connect* launcher will then be able to run the app.

For development purposes, the module can be built using:

	npm run dev

This will notice for changes and rebuild when nessecary.
