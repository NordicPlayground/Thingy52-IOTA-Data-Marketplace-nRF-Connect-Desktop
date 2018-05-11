# nRF Connect Thingy:52 IOTA Data Marketplace Publisher


*nRF Connect Thingy:52 IOTA Data Marketplace Publisher* (nRF Connect IDMP) is a cross platform tool that enables connection with the nRF52 development kit and utilize it's Bluetooth<sup>&reg;</sup> functionalities. The module is built to perform mesurements using the Thingy:52 and publish this mesurments to the [IOTA Data Marketplace](https://data.iota.org/) 

*nRF Connect Thingy:52 IOTA Data Marketplace Publisher* is implemented as an app for [nRF Connect](https://github.com/NordicSemiconductor/pc-nrfconnect-core#creating-apps).

# Installation

To install the application you need to download the [nRF Connect product page](https://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF-Connect-for-desktop) on Nordic Semiconductor web pages. This is required as it is the profram this module is built for.

nRF Connect currently supports the following operating systems:

* Windows
* Ubuntu Linux 64-bit
* macOS

# Compiling from source

Since *nRF Connect* expects local apps in `$HOME/.nrfconnect-apps/local` (Linux/macOS) or `%USERPROFILE%/.nrfconnect-apps/local` (Windows) directory, make sure your repository is cloned or linked there.


## Dependencies

To build this project you will need to install the following tools:

* Node.js (>=6.9)
* npm (>=5.6.0) / yarn (>=1.4.0)

## Compiling

When *nRF Connect* have been installed, you are ready to start the compilation. Run the following command from the command line, standing in the root folder of the repository:

    npm install

When the procedure has completed successfully you can run the application by running:

    npm run dev

The built app can be loaded by *nRF Connect* launcher.

## Testing

Unit testing can be performed by running:

    npm test


# Feedback

* Ask questions on [DevZone Questions](https://devzone.nordicsemi.com)
* File code related issues on [GitHub Issues](https://github.com/BouvetNord/it2901_2018_nordic_iota/issues)