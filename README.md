# nodebb-plugin-openedx-discussion (A NodeBB plugin for Openedx)

By integrating this plugin we can use all the functionalities of NodeBB Discussion Forum in Open EdX in the following ways: 
1-  Session will be shared among Open EdX and NodeBB. 
2-  An embedded view of NodeBB discussion will be displayed in the course discussion.
 

### Prerequisites

* Open edX (hawthorn or later) instance
* NodeBB (v1.10.x or above) instance.

### Enabling the plugin

To enable this plugin we need to configure both of your Open EdX and NodeBB instances according to the following steps:

1. Install [openedx-nodebb-discussion](https://github.com/arbisoft/openedx-nodebb-discussion) in your Open edX instance using its [README](https://github.com/arbisoft/openedx-nodebb-discussion/blob/master/README.md). 
2. Integrate [nodebb-plugin-openedx-discussion](https://github.com/arbisoft/nodebb-plugin-openedx-discussion) plugin in your NodeBB instance, using the Installation Guide given bellow.


### Installation Guide

#### Automated method
To install `nodebb-plugin-openedx-discussion` using the `curl` command follow the following steps:

1. Navigate to NodeBB directory.
2. Run the following command to install and activate the plugin:
```sh
$ curl https://raw.githubusercontent.com/edly-io/nodebb-plugin-openedx-discussion/master/install.sh | bash
```

#### Manual menthod
To install `nodebb-plugin-openedx-discussion` manually follow the following steps:

1. Run your NodeBB instance, in the admin panel go to `Extend->Plugins`, in `Plugin Search` search for `nodebb-plugin-openedx-discussion` then install and activate this plugin and restart NodeBB.
2. Again go to admin panel, in `Plugins` tab select `Openedx Discussion` option.
3. Enter `JWT cookie name` and `Secret`, make sure that these settings match with the settings of your [openedx-nodebb-discussion](https://github.com/arbisoft/openedx-nodebb-discussion) app.

The plugin is working now, you can check it by creating a course in you Open EdX instance with NodeBB enabled and selecting the `NodeBB Discussion` tab where a NodeBB iframe will be shown to you. 

## License

The code in this repository is licensed under the GPL v3.0 unless otherwise noted. Please see [LICENSE.md](https://github.com/edly-io/nodebb-plugin-openedx-discussion/blob/master/LICENSE) for the details.

## How To Contribute

To contribute, please make a pull request in this repositry on Github: [nodebb-plugin-openedx-discussion](https://github.com/arbisoft/nodebb-plugin-openedx-discussion). If you have any question or issue, please feel free to open an [issue](https://github.com/edly-io/nodebb-plugin-openedx-discussion/issues) on Github. 


## Contributors

* [Muhammad Zeeshan](https://github.com/zee-pk)
* [Osama Arshad](https://github.com/asamolion)
* [Tehreem Sadat](https://github.com/tehreem-sadat)
* [Danial Malik](https://github.com/danialmalik)
* [Hamza Farooq](https://github.com/HamzaIbnFarooq)
* [Hassan Tariq](https://github.com/imhassantariq)
* [Muhammad Umar Khan](https://github.com/mumarkhan999)
