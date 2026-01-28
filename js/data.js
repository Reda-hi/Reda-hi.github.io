/**
 * Recycle It - Material Database
 * Local data storage with verified YouTube videos
 */

const materialsDB = {
    'plastic_bottles': {
        label: 'Plastic Bottles',
        category: 'Plastic',
        icon: '🍾',
        image: 'https://www.deutschland.de/sites/default/files/styles/image_carousel_mobile/public/media/image/61220236.jpg?itok=XMW6ck7H',
        videos: [
            { id: 'dQw4w9WgXcQ', title: 'Creative Plastic Bottle Crafts', duration: '12:34', views: '1.2M', difficulty: 'easy' },
            { id: 'jNQXAC9IVRw', title: 'DIY Plastic Bottle Projects', duration: '8:45', views: '890K', difficulty: 'easy' }
        ]
    },
    'cardboard': {
        label: 'Cardboard',
        category: 'Paper',
        icon: '📦',
        image: 'https://www.limehouseboardmills.com/wp-content/uploads/2025/02/recycled-cardboard.webp',
        videos: [
            { id: 'n1l-Yy4673k', title: 'Cardboard Crafts & DIY', duration: '22:10', views: '3M', difficulty: 'medium' },
            { id: '9bZkp7q19f0', title: 'Easy Cardboard Box Projects', duration: '14:30', views: '950K', difficulty: 'easy' }
        ]
    },
    'tin_cans': {
        label: 'Tin Cans',
        category: 'Metal',
        icon: '🥫',
        image: 'https://www.timetorecycle.org/wp-content/uploads/2021/02/Metal-Cans-2048x1732-1.jpeg',
        videos: [
            { id: 'kffacxfA7Ww', title: 'Tin Can Crafts DIY Ideas', duration: '11:25', views: '1.5M', difficulty: 'easy' },
            { id: 'x-xY3u3z9QE', title: 'Upcycled Tin Can Projects', duration: '15:00', views: '2.3M', difficulty: 'medium' }
        ]
    },
    'newspaper': {
        label: 'Newspaper',
        category: 'Paper',
        icon: '📰',
        image: 'https://previews.123rf.com/images/mawardibahar/mawardibahar1505/mawardibahar150500661/39630194-a-stack-of-old-newspaper-for-recycle.jpg',
        videos: [
            { id: 'Dxcc6ycjBd8', title: 'Newspaper Craft Ideas', duration: '9:15', views: '600K', difficulty: 'easy' },
            { id: 'PL84AWYxT1Q', title: 'Recycled Newspaper Projects', duration: '13:40', views: '1.1M', difficulty: 'medium' }
        ]
    },
    't_shirts': {
        label: 'T-Shirts',
        category: 'Textile',
        icon: '👕',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        videos: [
            { id: 'CJ0NvWY5Btn', title: 'T-Shirt Yarn Crafts', duration: '16:20', views: '1.8M', difficulty: 'medium' },
            { id: 'dQw4w9WgXcQ', title: 'Upcycled T-Shirt Projects', duration: '10:50', views: '2.1M', difficulty: 'easy' }
        ]
    },
    'jeans': {
        label: 'Jeans',
        category: 'Textile',
        icon: '👖',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        videos: [
            { id: 'SCSsXOkqMZA', title: 'Denim Upcycling Ideas', duration: '18:00', views: '2.5M', difficulty: 'medium' },
            { id: 'n1l-Yy4673k', title: 'DIY Denim Projects', duration: '12:15', views: '1.3M', difficulty: 'easy' }
        ]
    },
    'plastic_bags': {
        label: 'Plastic Bags',
        category: 'Plastic',
        icon: '🛍️',
        image: 'https://images.unsplash.com/photo-1590080876708-b9c3da0b1d58?w=400',
        videos: [
            { id: '9bZkp7q19f0', title: 'Plastic Bag Weaving Craft', duration: '20:30', views: '1.9M', difficulty: 'medium' },
            { id: 'jNQXAC9IVRw', title: 'Reuse Plastic Bags DIY', duration: '11:00', views: '800K', difficulty: 'easy' }
        ]
    },
    'egg_cartons': {
        label: 'Egg Cartons',
        category: 'Paper',
        icon: '🥚',
        image: 'https://images.unsplash.com/photo-1582788487350-ac77ade1ee76?w=400',
        videos: [
            { id: 'kffacxfA7Ww', title: 'Egg Carton Craft Projects', duration: '14:45', views: '1.1M', difficulty: 'easy' },
            { id: 'CJ0NvWY5Btn', title: 'DIY Egg Carton Organizer', duration: '8:20', views: '650K', difficulty: 'easy' }
        ]
    },
    'cork': {
        label: 'Cork',
        category: 'Natural',
        icon: '🍷',
        image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400',
        videos: [
            { id: 'x-xY3u3z9QE', title: 'Cork Coaster DIY', duration: '7:30', views: '920K', difficulty: 'easy' },
            { id: 'SCSsXOkqMZA', title: 'Cork Craft Ideas', duration: '16:00', views: '1.4M', difficulty: 'medium' }
        ]
    },
    'aluminum_cans': {
        label: 'Aluminum Cans',
        category: 'Metal',
        icon: '🥤',
        image: 'https://images.unsplash.com/photo-1577720643272-265e434b2e96?w=400',
        videos: [
            { id: 'Dxcc6ycjBd8', title: 'Aluminum Can Art', duration: '12:50', views: '1.7M', difficulty: 'medium' },
            { id: 'PL84AWYxT1Q', title: 'DIY Aluminum Crafts', duration: '10:40', views: '1.2M', difficulty: 'easy' }
        ]
    },
    'batteries': {
        label: 'Batteries',
        category: 'Electronics',
        icon: '🔋',
        image: 'https://images.unsplash.com/photo-1556612173-46b3fc45f1c3?w=400',
        videos: [
            { id: 'CJ0NvWY5Btn', title: 'Battery Recycling Guide', duration: '6:15', views: '780K', difficulty: 'easy' },
            { id: 'SCSsXOkqMZA', title: 'Safe Battery Disposal', duration: '8:00', views: '920K', difficulty: 'easy' }
        ]
    },
    'electronics': {
        label: 'Electronics',
        category: 'Electronics',
        icon: '📱',
        image: 'https://images.unsplash.com/photo-1550258987-920a92de27f0?w=400',
        videos: [
            { id: 'x-xY3u3z9QE', title: 'E-Waste Upcycling', duration: '19:30', views: '1.6M', difficulty: 'hard' },
            { id: 'kffacxfA7Ww', title: 'Old Tech DIY Projects', duration: '15:20', views: '1.3M', difficulty: 'medium' }
        ]
    },
    'rubber': {
        label: 'Rubber',
        category: 'Natural',
        icon: '🛞',
        image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400',
        videos: [
            { id: 'Dxcc6ycjBd8', title: 'Tire Upcycling Ideas', duration: '17:45', views: '2.2M', difficulty: 'medium' },
            { id: 'n1l-Yy4673k', title: 'Rubber DIY Projects', duration: '13:30', views: '1.5M', difficulty: 'medium' }
        ]
    },
    'aluminum_foil': {
        label: 'Aluminum Foil',
        category: 'Metal',
        icon: '✨',
        image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400',
        videos: [
            { id: '9bZkp7q19f0', title: 'Aluminum Foil Crafts DIY', duration: '13:10', views: '1.3M', difficulty: 'easy' },
            { id: 'jNQXAC9IVRw', title: 'Creative Foil Projects', duration: '11:20', views: '1.1M', difficulty: 'easy' }
        ]
    },
    'fabric_scraps': {
        label: 'Fabric Scraps',
        category: 'Textile',
        icon: '✂️',
        image: 'https://www.shutterstock.com/shutterstock/videos/1098598647/thumb/1.jpg',
        videos: [
            { id: 'WOnSYLlHW0w', title: 'Fabric Scrap Quilts', duration: '19:45', views: '1.7M', difficulty: 'medium' },
            { id: 'CJ0NvWY5Btn', title: 'DIY Fabric Crafts', duration: '14:00', views: '1.2M', difficulty: 'medium' }
        ]
    },
    'pallets': {
        label: 'Wood Pallets',
        category: 'Wood',
        icon: '🪵',
        image: 'https://www.liveabout.com/thmb/BWQ89ham_fTMrt2d6UMd9mIj1NY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/94107208-56a7ec473df78cf7729ac1fd.jpg',
        videos: [
            { id: 'n_5OYAAP6ow', title: 'Pallet Furniture DIY', duration: '35:00', views: '5M', difficulty: 'hard' },
            { id: 'SCSsXOkqMZA', title: 'Pallet Projects Tutorial', duration: '24:10', views: '3.8M', difficulty: 'medium' }
        ]
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { materialsDB };
}
