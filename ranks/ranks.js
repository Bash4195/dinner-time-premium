// Default rank settings
// User rank is in user schema as default setting
var ranks = {
    GOD: {
        rank: 'GOD',
        roles: ['User', 'Staff', 'Admin', 'Super Admin', 'Owner'],
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
        roles: ['User', 'Staff', 'Admin', 'Super Admin', 'Owner'],
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
        roles: ['User', 'Staff', 'Admin', 'Super Admin'],
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
        roles: ['User', 'Staff', 'Admin', 'Super Admin'],
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
        roles: ['User'],
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
        roles: ['User'],
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
        roles: ['User'],
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
        roles: ['User'],
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
        roles: ['User'],
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