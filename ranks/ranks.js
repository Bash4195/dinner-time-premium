// Default rank settings
// User rank is in user schema as default setting
var ranks = {
    GOD: {
        rank: 'GOD',
        permissions: {
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
        }
    },
    GODDESS: {
        rank: 'GODDESS',
        permissions: {
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
        }
    },
    Seraph: {
        rank: 'Seraph',
        permissions: {
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
        }
    },
    Lord: {
        rank: 'Lord',
        permissions: {
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
        }
    },
    Admin: {
        rank: 'Admin',
        permissions: {
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
        }
    },
    Moderator: {
        rank: 'Moderator',
        permissions: {
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
        }
    },
    Aristocrat: {
        rank: 'Aristocrat',
        permissions: {
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
    },
    VIP: {
        rank: 'VIP',
        permissions: {
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
    },
    Donator: {
        rank: 'Donator',
        permissions: {
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
    }
};

module.exports = ranks;