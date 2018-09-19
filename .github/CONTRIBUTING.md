# How to Contribute
This project welcomes contributions and suggestions. 

If you encounter any bugs or want to request new features, feel free to open an [GitHub Issue](https://github.com/metatron-app/metatron-discovery/issues) in the repo so that the community can find resolutions for it. 
Although, please check before you raise an issue. That is, 
please make sure someone else hasn’t already created an issue for the same topic.


## Pull Requests
Metatron project only accepts pull requests related to open issues.

So, please first discuss the change you wish to make via [GitHub Issue](https://github.com/metatron-app/metatron-discovery/issues) with the owners of this repository before making a change. 
After sufficient discussion, send us your pull requests! 

**CAUTION!** We are operating release branch. Not allow merging into master branch.
So, your pull request's base is must set to our planned release branch.
We will give you information during pre-discussion.

It is frequently necessary to synchronize your branch with other changes that have landed in base(release) branch by using git rebase.
```
git fetch --all
git rebase origin/${base branch}


# The git push --force-with-lease command is one of the few ways to delete history in git. 
# Before you use it, make sure you understand the risks and discuss with your co-workers.

git push --force-with-lease origin my-branch
```

* Fill in [the required template](PULL_REQUEST_TEMPLATE.md)
  - Please try to do your best at filling out the details, but feel free to skip parts if you're not sure what to put.
* Do **NOT** include issue numbers in the PR title
  - Github will automatically set the title based on your branch name. You have to rewrite using a clear and descriptive title. 
    
    
## Reporting Security Vulnerability

If you discover a security issue in this project, please report in private to our 
[e-mail](metatron@sk.com).
Please do **NOT** create publicly viewable issues for suspected security vulnerabilities.

Thanks for helping make Metatron safe for everyone.
