### Mono Repo

Monorepo achitecture allows us to manage our project/packages so that we only have one `node_modules` folder for all our packages.

### Yarn Workspaces

<div align="center"><img src="https://miro.medium.com/max/700/0*0kT7DlZeWNZRZ8hT.jpg"></div>

Yarn Workspaces is a feature that allows users to install dependencies from multiple package.json files in sub-folders of a single root package.json file, all in one go. Yarn workspaces allows us to have a single `node_modules` folder for all our packages and each package will have it's node module. The folder structure of a mono-repo looks as follows:

```
node_modules:
    packages:
        package_a:
            package.json
            ...
        package_b:
            package.json
            ...
        ...
package.json
```

### References

- [Docs](https://classic.yarnpkg.com/lang/en/docs/workspaces/)
