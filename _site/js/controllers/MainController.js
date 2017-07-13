/**
 * Copyright 2017 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

angular.module('app')
.controller('MainController', ['$scope', 'github', 'config', '$location', function($scope, github, config, $location) {

    var github_token;
    var repoLocation;

    config.get(function(data) {
        //github_token = data.github_token;
        repoLocation = data.github_repos_url;
        getAllGitHubData();
    })

    var repos = [];
    var pageNumber = 1;


    //set the filter to the variable in the Url
    var path = $location.path();
    $scope.myFilter = path.slice(1);

   //set the url path to the filter
    $scope.click = function(filter) {
        $location.path(filter);
    };

    // set the filter to the path of the url
    $scope.$on('$locationChangeSuccess', function(event) {
        var path = $location.path();
        $scope.myFilter = path.slice(1);
        //console.log($scope.myFilter);
    });

    //sorting function and variables
    $scope.sortType = '-repositoryData.pushed_at'
    $scope.reverseSort = false

    $scope.changeSortType = function(sortType) {
        $scope.sortType = sortType;
    }

    $scope.changeOrder = function() {
        $scope.reverseSort = !$scope.reverseSort;
    }

    //code for filtering based on tags in the repository

    //array holding the unique filters generated from the tags and the prefixes
    $scope.arrayOfFilters = [];
    //arrays used to hold the filters until they are pushed into the data array by index
    arrayOfPrefixes = [];
    arrayOfTags = [];

    //array holding the repo data and each repos filters
    $scope.arrayOfFiltersAndData = [];
    //array holding the arrayOfFiltersAndData
    $scope.masterArrayOfFiltersAndData = [];

    // code for filtering based on prefix in the repository name
    generateFilters = function() {
        for (var i = 0, len = repos.length; i < len; i++) {
            var repo = repos[i];

            //get the prefix
            var firstPeriodLocation = repo.name.indexOf(".");
            var prefix = repo.name.substr(0, firstPeriodLocation);

            //change the prefixes to more user readable names
            switch (prefix) {
                case "":
                case "odmdev":
                    prefix = ""
                    break;
                case "sample":
                    prefix = "samples";
                    break;
                case "ci":
                    prefix = "continuous integration";
                    break;
                case "lib":
                    prefix = "libraries";
                    break;
                case "tool":
                    prefix = "tools";
                    break;
                }

                if (repo.name.indexOf("docker") > -1)
                {
                  prefix="docker";
                }

            //Add all prefixes to array of prefixes, to then later be pushed to arrayOfFiltersAndData
            arrayOfPrefixes.push(prefix);
            //if the prefix is unique, add to array of prefixes
            if ($scope.arrayOfFilters.indexOf(prefix) == -1)
                $scope.arrayOfFilters.push(prefix);
        }
    }

    //code for filtering based on tags in the repository
    generateTags = function() {
        angular.forEach(repos, function(repo, index) {
            //split the descriptions into individual words
            if (undefined == repo.topics) {
              repo.topics == [];
            }

            angular.forEach(repo.topics, function(topic, topic_idx) {
                //push to array containing all the tags
                arrayOfTags[index] = topic;

                //push the tag to the array of filters, only if unique
                if ($scope.arrayOfFilters.indexOf(topic) == -1) {
                    $scope.arrayOfFilters.push(topic);
                }
            });
            arrayOfWords = [];
        });
    }

    //code for creating the arrayOfFilteresAndData Object, used by the directives
    pushToArray = function() {
        angular.forEach(arrayOfPrefixes, function(prefix, index) {
            var tags = [];
            //add prefix to tags
            tags.push(prefix);
            //if tag is not null, add to tags
            if (arrayOfTags[index] != null) {
                tags.push(arrayOfTags[index])
            }

            arrayOfFilteresAndData = {tags: tags, repositoryData: repos[index]};

            //add to master array
            $scope.masterArrayOfFiltersAndData.push(arrayOfFilteresAndData);
        });
    }

    //getting the data
    getAllGitHubData = function() {
        url = repoLocation + "?per_page=100&page=" + pageNumber;
        github.getGitHubData(url, function(response) {
            repos = repos.concat(response.data);
            if (location.search == null){
                if (response.headers('link').indexOf("next") >= 0){
                    pageNumber = pageNumber + 1;
                    getAllGitHubData();
                }
               else {
                    pushToArray();
                    generateFilters();
                    generateTags();
                    pushToArray();
                }
            }
            else {
                pushToArray();
                generateFilters();
                generateTags();
                pushToArray();
            }
        });
    }



}]);