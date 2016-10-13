var defaultPermissions = {
    GOD: {
        general: {
            modifyRules: true,
            // Mod Application
            canApplyToMod:true
        },
        news: {
            createNews: true,
            updateNews: true,
            deleteNews: true,

            createComments: true,
            updateComments: true,
            deleteComments: true
        },
        forum: {
            createCategories: true,
            updateCategories: true,
            deleteCategories: true,

            createPosts: true,
            updatePosts: true,
            deletePosts: true,
            lockPosts: true,
            movePosts: true,

            createComments: true,
            updateComments: true,
            deleteComments: true
        }
    },
    GODDESS: {
        general: {
            modifyRules: true,
            // Mod Application
            canApplyToMod: false
        },
        news: {
            createNews: true,
            updateNews: true,
            deleteNews: true,

            createComments: true,
            updateComments: true,
            deleteComments: true
        },
        forum: {
            createCategories: true,
            updateCategories: true,
            deleteCategories: true,

            createPosts: true,
            updatePosts: true,
            deletePosts: true,
            lockPosts: true,
            movePosts: true,

            createComments: true,
            updateComments: true,
            deleteComments: true
        }
    },
    Seraph: {
        general: {
            modifyRules: true,
            // Mod Application
            canApplyToMod: false
        },
        news: {
            createNews: true,
            updateNews: true,
            deleteNews: true,

            createComments: true,
            updateComments: true,
            deleteComments: true
        },
        forum: {
            createCategories: true,
            updateCategories: true,
            deleteCategories: true,

            createPosts: true,
            updatePosts: true,
            deletePosts: true,
            lockPosts: true,
            movePosts: true,

            createComments: true,
            updateComments: true,
            deleteComments: true
        }
    },
    Lord: {
        general: {
            modifyRules: true,
            // Mod Application
            canApplyToMod: false
        },
        news: {
            createNews: true,
            updateNews: true,
            deleteNews: true,

            createComments: true,
            updateComments: true,
            deleteComments: true
        },
        forum: {
            createCategories: true,
            updateCategories: true,
            deleteCategories: true,

            createPosts: true,
            updatePosts: true,
            deletePosts: true,
            lockPosts: true,
            movePosts: true,

            createComments: true,
            updateComments: true,
            deleteComments: true
        }
    },
    Admin: {
        general: {
            modifyRules: false,
            // Mod Application
            canApplyToMod: false
        },
        news: {
            createNews: false,
            updateNews: false,
            deleteNews: false,

            createComments: true,
            updateComments: true,
            deleteComments: true
        },
        forum: {
            createCategories: false,
            updateCategories: false,
            deleteCategories: false,

            createPosts: true,
            updatePosts: true,
            deletePosts: true,
            lockPosts: true,
            movePosts: true,

            createComments: true,
            updateComments: true,
            deleteComments: true
        }
    },
    Moderator: {
        general: {
            modifyRules: false,
            // Mod Application
            canApplyToMod: false
        },
        news: {
            createNews: false,
            updateNews: false,
            deleteNews: false,

            createComments: true,
            updateComments: true,
            deleteComments: true
        },
        forum: {
            createCategories: false,
            updateCategories: false,
            deleteCategories: false,

            createPosts: true,
            updatePosts: true,
            deletePosts: true,
            lockPosts: true,
            movePosts: true,

            createComments: true,
            updateComments: true,
            deleteComments: true
        }
    },
    Aristocrat: {
        general: {
            modifyRules: false,
            // Mod Application
            canApplyToMod: true
        },
        news: {
            createNews: false,
            updateNews: false,
            deleteNews: false,

            createComments: true,
            updateComments: false,
            deleteComments: false
        },
        forum: {
            createCategories: false,
            updateCategories: false,
            deleteCategories: false,

            createPosts: true,
            updatePosts: false,
            deletePosts: false,
            lockPosts: false,
            movePosts: false,

            createComments: true,
            updateComments: false,
            deleteComments: false
        }
    },
    VIP: {
        general: {
            modifyRules: false,
            // Mod Application
            canApplyToMod: true
        },
        news: {
            createNews: false,
            updateNews: false,
            deleteNews: false,

            createComments: true,
            updateComments: false,
            deleteComments: false
        },
        forum: {
            createCategories: false,
            updateCategories: false,
            deleteCategories: false,

            createPosts: true,
            updatePosts: false,
            deletePosts: false,
            lockPosts: false,
            movePosts: false,

            createComments: true,
            updateComments: false,
            deleteComments: false
        }
    },
    Donator: {
        general: {
            modifyRules: false,
            // Mod Application
            canApplyToMod: true
        },
        news: {
            createNews: false,
            updateNews: false,
            deleteNews: false,

            createComments: true,
            updateComments: false,
            deleteComments: false
        },
        forum: {
            createCategories: false,
            updateCategories: false,
            deleteCategories: false,

            createPosts: true,
            updatePosts: false,
            deletePosts: false,
            lockPosts: false,
            movePosts: false,

            createComments: true,
            updateComments: false,
            deleteComments: false
        }
    },
    User: {
        general: {
            modifyRules: false,
            // Mod Application
            canApplyToMod: true
        },
        news: {
            createNews: false,
            updateNews: false,
            deleteNews: false,

            createComments: true,
            updateComments: false,
            deleteComments: false
        },
        forum: {
            createCategories: false,
            updateCategories: false,
            deleteCategories: false,

            createPosts: true,
            updatePosts: false,
            deletePosts: false,
            lockPosts: false,
            movePosts: false,

            createComments: true,
            updateComments: false,
            deleteComments: false
        }
    }
};

module.exports = defaultPermissions;