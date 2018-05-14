# nRF Connect Thingy:52 IOTA Data Marketplace Publisher
*nRF Connect Thingy:52 IOTA Data Marketplace Publisher*
(nRF Connect IDMP) is a module built to collect sensor readings using
the *Nordic Thingy:52*, and publish these measurements to the
[IOTA Data Marketplace](https://data.iota.org/) (IDMP). The module
uses the [nRF52 Development Kit](https://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF52-DK)
to allow for Bluetooth Low Energy (BLE) communication with the
Thingy. nRF Connect Thingy:52 is implemented as an app for nRF
Connect.


# Installation
visit the product page, and download the app
To start using the application, first make sure you have installed nRF Connect, which can be found at the nRF Connect product page.
This is the platform for which the module is built.

To install the application you need to download the [nRF Connect product page](https://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF-Connect-for-desktop) on Nordic Semiconductor web pages. This is required as it is the profram this module is built for.

nRF Connect currently supports the following operating systems:

* Windows
* Ubuntu Linux 64-bit
* macOS


# Compiling from source
Since *nRF Connect* expects local apps in
`$HOME/.nrfconnect-apps/local` (Linux/macOS) or
`%USERPROFILE%/.nrfconnect-apps/local` (Windows) directory, make sure
your repository is cloned or linked there.


## Dependencies

To build this project you will need to install the following tools:

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

This will watch for changes and rebuild when nessecary.


# Feedback

* Ask questions on [DevZone Questions](https://devzone.nordicsemi.com)
* File code related issues on [GitHub Issues](https://github.com/BouvetNord/it2901_2018_nordic_iota/issues)
