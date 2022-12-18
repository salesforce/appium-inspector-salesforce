# Appium Inspector

![Appium Inspector icon](./docs/icon.png)

# IMPORTANT NOTE

This project is a fork of the official [appium-inspector](https://github.com/appium/appium-inspector)-project and holds a few Salesforce specific adjustments.

The biggest adjustment in this project is the ability to manually inspect the [UTAM](https://utam.dev/) [Page Object](https://www.npmjs.com/package/salesforce-pageobjects) that published by Salesforce to quickly find out the right Page Object(s) for the target page/component.

The reason why this became a fork instead of a new feature in the existing Appium Inspector is that, in consultation with the Appium core team, it was decided that it was better to not implement vendor specific features into Appium Inspector. We agreed that a fork would be the best way to go forward.

This fork will be updated with all new features/fixes of the original [Appium Inspector](https://github.com/appium/appium-inspector)-project so you can see this as a Salesforce specific replacement of the/your current Appium Inspector.

## Installation

Since this is just a standard Appium Inspector with Salesforce specific feature built on top of it, you can use the same [install instructions](https://github.com/appium/appium-inspector#installation) and launch it.  You can get the most recent published version of this app at the [Releases](https://github.com/salesforce/appium-inspector-salesforce/releases/) section of this repo.

## Inspect UTAM Page Object

After starting a new session with the test application, then navigate to the UTAM Page Object Tree Tab as shown here ![screenshot](./docs/utam-pageobject-window.png).

To inspect the [Saleforce published Page Objects](https://www.npmjs.com/package/salesforce-pageobjects) that you have downloaded, you need to configure the values for Page Object Module Name and Page Object Full Path. The modoule name for [SalesforceApp](https://developer.salesforce.com/tools/mobile-debugging) is salesforceapp, and for [Mobile Publisher Playground App](https://help.salesforce.com/s/articleView?id=sf.s1_branded_apps_playground_preview_exp_site.htm&type=5) is playgroundapp. The path is the full path of the unziped package folder. For exmaple, if I have a local package salesforce-pageobjects-2.0.0.tgz at: ${Home}/pageobjects, after unzipping it, the full path value should be ${Home}/pageobjects. 

To inspect the customer Page Object package, you only need to configure the full path of the direct parent folder of all page object json files. For example, if I have cutomer Page Objects that are all under ${Home}/pageobjects//src/main/resources/spec, then the full path value should be ${Home}/pageobjects//src/main/resources/spec.

Now, you can start inspect via clicking Start Inspect button to find out all avaialbe Page Objects for the test device platform (iOS or Android) in the configured package. ![screenshot](./docs/inspecting-result.png)

Utill to this step, you can start to work your target page/component via navigating test applicaton on your local simulator or emulator, then you can find out the UTAM Page Object(s) for the current page via clicking Find Current PO button. Inspector helps to find out all matched root Page Object and children Page Objects. Moreover, it exposes all methods (both for Java and JavaScript) that to interact with the element(s) on the page for test script. ![screenshot](./docs/inspecting-current.png)

## License
The UTAM Java compiler is licensed under the [MIT license](LICENSE).
