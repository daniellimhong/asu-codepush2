# Settings

The set of components in this folder are meant to serve as an abstraction between components and 
the maintenance of settings in AsyncStorage.

Settings will automatically handle namespacing of component settings.

It currently only handles the order of elements on the home page, but in the future it will be agnostic enough so that any implementing component will be able to store and modify it's own settings


# Dependencies

- Weblogin - ASURite is used to namespace each user's settings per-device.

# ToDo

- Make settings functions agnostic
- Turn into a HoC so that people can use without knowledge of Context