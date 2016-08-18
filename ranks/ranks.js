// Default rank settings
// User rank is in user schema as default setting
var ranks = {
    GOD: {
        rank: 'GOD',
        permissions: {
            forum: {
                createCategories: {type: String, default: true},
                updateCategories: {type: String, default: true},
                deleteCategories: {type: String, default: true},

                createPosts: {type: String, default: true},
                updatePosts: {type: String, default: true},
                deletePosts: {type: String, default: true},
                lockPosts: {type: String, default: true},
                movePosts: {type: String, default: true},

                createComments: {type: String, default: true},
                updateComments: {type: String, default: true},
                deleteComments: {type: String, default: true}
            }
        }
    },
    GODDESS: {
        rank: 'GODDESS',
        permissions: {
            forum: {
                createCategories: {type: String, default: true},
                updateCategories: {type: String, default: true},
                deleteCategories: {type: String, default: true},

                createPosts: {type: String, default: true},
                updatePosts: {type: String, default: true},
                deletePosts: {type: String, default: true},
                lockPosts: {type: String, default: true},
                movePosts: {type: String, default: true},

                createComments: {type: String, default: true},
                updateComments: {type: String, default: true},
                deleteComments: {type: String, default: true}
            }
        }
    },
    Seraph: {
        rank: 'Seraph',
        permissions: {
            forum: {
                createCategories: {type: String, default: true},
                updateCategories: {type: String, default: true},
                deleteCategories: {type: String, default: true},

                createPosts: {type: String, default: true},
                updatePosts: {type: String, default: true},
                deletePosts: {type: String, default: true},
                lockPosts: {type: String, default: true},
                movePosts: {type: String, default: true},

                createComments: {type: String, default: true},
                updateComments: {type: String, default: true},
                deleteComments: {type: String, default: true}
            }
        }
    },
    Lord: {
        rank: 'Lord',
        permissions: {
            forum: {
                createCategories: {type: String, default: true},
                updateCategories: {type: String, default: true},
                deleteCategories: {type: String, default: true},

                createPosts: {type: String, default: true},
                updatePosts: {type: String, default: true},
                deletePosts: {type: String, default: true},
                lockPosts: {type: String, default: true},
                movePosts: {type: String, default: true},

                createComments: {type: String, default: true},
                updateComments: {type: String, default: true},
                deleteComments: {type: String, default: true}
            }
        }
    },
    Admin: {
        rank: 'Admin',
        permissions: {
            forum: {
                createCategories: {type: String, default: false},
                updateCategories: {type: String, default: false},
                deleteCategories: {type: String, default: false},

                createPosts: {type: String, default: true},
                updatePosts: {type: String, default: true},
                deletePosts: {type: String, default: true},
                lockPosts: {type: String, default: true},
                movePosts: {type: String, default: true},

                createComments: {type: String, default: true},
                updateComments: {type: String, default: true},
                deleteComments: {type: String, default: true}
            }
        }
    },
    Moderator: {
        rank: 'Moderator',
        permissions: {
            forum: {
                createCategories: {type: String, default: false},
                updateCategories: {type: String, default: false},
                deleteCategories: {type: String, default: false},

                createPosts: {type: String, default: true},
                updatePosts: {type: String, default: true},
                deletePosts: {type: String, default: true},
                lockPosts: {type: String, default: true},
                movePosts: {type: String, default: true},

                createComments: {type: String, default: true},
                updateComments: {type: String, default: true},
                deleteComments: {type: String, default: true}
            }
        }
    },
    Aristocrat: {
        rank: 'Aristocrat',
        permissions: {
            forum: {
                createCategories: {type: String, default: false},
                updateCategories: {type: String, default: false},
                deleteCategories: {type: String, default: false},

                createPosts: {type: String, default: true},
                updatePosts: {type: String, default: false},
                deletePosts: {type: String, default: false},
                lockPosts: {type: String, default: false},
                movePosts: {type: String, default: false},

                createComments: {type: String, default: true},
                updateComments: {type: String, default: false},
                deleteComments: {type: String, default: false}
            }
        }
    },
    VIP: {
        rank: 'VIP',
        permissions: {
            forum: {
                createCategories: {type: String, default: false},
                updateCategories: {type: String, default: false},
                deleteCategories: {type: String, default: false},

                createPosts: {type: String, default: true},
                updatePosts: {type: String, default: false},
                deletePosts: {type: String, default: false},
                lockPosts: {type: String, default: false},
                movePosts: {type: String, default: false},

                createComments: {type: String, default: true},
                updateComments: {type: String, default: false},
                deleteComments: {type: String, default: false}
            }
        }
    },
    Donator: {
        rank: 'Donator',
        permissions: {
            forum: {
                createCategories: {type: String, default: false},
                updateCategories: {type: String, default: false},
                deleteCategories: {type: String, default: false},

                createPosts: {type: String, default: true},
                updatePosts: {type: String, default: false},
                deletePosts: {type: String, default: false},
                lockPosts: {type: String, default: false},
                movePosts: {type: String, default: false},

                createComments: {type: String, default: true},
                updateComments: {type: String, default: false},
                deleteComments: {type: String, default: false}
            }
        }
    }
};

module.exports = ranks;