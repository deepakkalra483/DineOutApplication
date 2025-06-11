import AsyncStorage from '@react-native-community/async-storage';

export const storeUser = (user, onSuccess) => {
  const data = JSON.stringify(user);
  AsyncStorage.setItem(USER, data).then(() => {
    onSuccess();
  });
};

export const getUser = onSuccess => {
  AsyncStorage.getItem(USER).then(res => {
    const data = JSON.parse(res);
    onSuccess(data);
  });
};

export const SetMenu = (menu, onSuccess, onFailure) => {
  AsyncStorage.getItem(MENU) // Replace 'MENU' with the actual key you are using.
    .then(res => {
      let updatedMenu = [];

      if (res) {
        const previousData = JSON.parse(res);

        // Check if the category already exists
        const categoryIndex = previousData.findIndex(
          item => item.category === menu.category,
        );

        if (categoryIndex !== -1) {
          // Add the item to the existing category
          previousData[categoryIndex].items.push(menu.item);
          updatedMenu = previousData;
        } else {
          // Add a new category with the items
          updatedMenu = [
            ...previousData,
            {category: menu?.category, items: [menu?.item]},
          ];
          getCategories(res => {
            if (res) {
              const newList = [...res, menu?.category];
              AsyncStorage.setItem(CATEGORY_LIST, JSON.stringify(newList));
            } else {
              const categoryList = [menu?.category];
              AsyncStorage.setItem(CATEGORY_LIST, JSON.stringify(categoryList));
            }
          });
        }
      } else {
        // If no previous data exists, create a new menu
        updatedMenu = [{category: menu?.category, items: [menu?.item]}];
      }

      // Save the updated menu back to AsyncStorage
      AsyncStorage.setItem(MENU, JSON.stringify(updatedMenu))
        .then(() => onSuccess?.(updatedMenu))
        .catch(err => onFailure?.(err));
    })
    .catch(err => onFailure?.(err));
};

export const EditMenuItem = (cat, data, onSuccess) => {
  AsyncStorage.getItem(MENU).then(res => {
    if (res) {
      const menuArray = JSON.parse(res);

      // Find the category index
      const categoryIndex = menuArray.findIndex(item => item.category === cat);

      if (categoryIndex !== -1) {
        // Find the item index within the category
        const itemIndex = menuArray[categoryIndex]?.items?.findIndex(
          item => item.id === data?.id,
        );

        if (itemIndex !== -1) {
          // Update the item with new data
          // menuArray[categoryIndex].items[itemIndex] = {
          //   ...menuArray[categoryIndex].items[itemIndex],
          //   ...data,
          // };
          console.log('data--', data);
          menuArray[categoryIndex].items[itemIndex] = data;

          // Save the updated menu back to AsyncStorage
          AsyncStorage.setItem(MENU, JSON.stringify(menuArray))
            .then(() => {
              console.log('Menu item updated successfully');
              onSuccess();
            })
            .catch(err => {
              console.error('Error saving updated menu:', err);
            });
        }
      }
    }
  });
};

export const EditCategory = (oldCategoryName, newCategoryData, onSuccess) => {
  AsyncStorage.getItem(MENU).then(res => {
    if (res) {
      const menuArray = JSON.parse(res);

      // Find the category index
      const categoryIndex = menuArray.findIndex(
        item => item.category === oldCategoryName,
      );

      if (categoryIndex !== -1) {
        // Update the category with new data (e.g., just the category name)
        menuArray[categoryIndex] = {
          ...menuArray[categoryIndex],
          ...newCategoryData, // example: { category: 'New Name' }
        };
        getCategories(res => {
          if (res) {
            const updateList = res.filter(
              cat => cat != oldCategoryName,
            );
            const newList = [...updateList, newCategoryData?.category];
            AsyncStorage.setItem(CATEGORY_LIST, JSON.stringify(newList));
          } else {
            const categoryList = [newCategoryData?.category];
            AsyncStorage.setItem(CATEGORY_LIST, JSON.stringify(categoryList));
          }
        });

        // Save the updated menu back to AsyncStorage
        AsyncStorage.setItem(MENU, JSON.stringify(menuArray))
          .then(() => {
            console.log('Category updated successfully');
            onSuccess();
          })
          .catch(err => {
            console.error('Error saving updated category:', err);
          });
      }
    }
  });
};

export const DeleteMenuItem = (cat, itemId, onSuccess) => {
  AsyncStorage.getItem(MENU).then(res => {
    if (res) {
      const menuArray = JSON.parse(res);

      // Find the category index
      const categoryIndex = menuArray.findIndex(item => item.category === cat);

      if (categoryIndex !== -1) {
        // Filter out the item to delete it
        const updatedItems = menuArray[categoryIndex].items.filter(
          item => item.id !== itemId,
        );

        // Update the items array in the category
        menuArray[categoryIndex].items = updatedItems;

        // Save the updated menu back to AsyncStorage
        AsyncStorage.setItem(MENU, JSON.stringify(menuArray))
          .then(() => {
            console.log('Menu item deleted successfully');
            onSuccess && onSuccess();
          })
          .catch(err => {
            console.error('Error saving updated menu:', err);
          });
      }
    }
  });
};

export const saveResturant = (resturant, onSuccess) => {
  getResturant(res => {
    if (res) {
      const newData = [...res, resturant];
      const StrinfyData = JSON.stringify(newData);
      AsyncStorage.setItem(RESTURANTS, StrinfyData).then(() => {
        onSuccess();
      });
    } else {
      const data = [resturant];
      const stringfy = JSON.stringify(data);
      AsyncStorage.setItem(RESTURANTS, stringfy).then(() => {
        onSuccess();
      });
    }
  });
};

export const getResturant = onSuccess => {
  AsyncStorage.getItem(RESTURANTS).then(res => {
    if (res) {
      const parsedData = JSON.parse(res);
      onSuccess(parsedData);
    } else {
      onSuccess(null);
    }
  });
};

export const deleteResturant = (id, onSuccess) => {
  getResturant(res => {
    const updatedList = res?.filter(data => data?.restaurantId != id);
    const strinfyList = JSON.stringify(updatedList);
    AsyncStorage.setItem(RESTURANTS, strinfyList).then(() => {
      onSuccess();
    });
  });
};

export const getMenu = onSuccess => {
  AsyncStorage.getItem(MENU).then(res => {
    if (res) {
      const parsedData = JSON.parse(res);
      onSuccess(parsedData);
    } else {
      onSuccess(null);
    }
  });
};

export const getCategories = onSuccess => {
  AsyncStorage.getItem(CATEGORY_LIST).then(res => {
    if (res) {
      const parsedData = JSON.parse(res);
      onSuccess(parsedData);
    } else {
      onSuccess(null);
    }
  });
};

// Resturant Menu functions

export const SetResturantMenu = (menu, onSuccess, onFailure) => {
  AsyncStorage.getItem(RESTURANT_MENU) // Replace 'MENU' with the actual key you are using.
    .then(res => {
      let updatedMenu = [];
      if (res) {
        const previousData = JSON.parse(res);

        // Check if the category already exists
        const categoryIndex = previousData.findIndex(
          item => item.category === menu.category,
        );

        if (categoryIndex !== -1) {
          // Add the item to the existing category
          previousData[categoryIndex].items.push(menu.item);
          updatedMenu = previousData;
        } else {
          // Add a new category with the items
          updatedMenu = [
            ...previousData,
            {category: menu?.category, items: [menu?.item]},
          ];
        }
      } else {
        // If no previous data exists, create a new menu
        updatedMenu = [{category: menu?.category, items: [menu?.item]}];
      }

      // Save the updated menu back to AsyncStorage
      AsyncStorage.setItem(RESTURANT_MENU, JSON.stringify(updatedMenu))
        .then(() => onSuccess?.(updatedMenu))
        .catch(err => onFailure?.(err));
    })
    .catch(err => onFailure?.(err));
};

export const getResturantMenu = onSuccess => {
  AsyncStorage.getItem(RESTURANT_MENU).then(res => {
    if (res) {
      const parsedData = JSON.parse(res);
      onSuccess(parsedData);
    } else {
      onSuccess(null);
    }
  });
};
export const SetCategory = (cat, item, onSuccess) => {
  GetCategory(res => {
    console.log('previous--', res);
    if (res) {
      const newData = {
        category: res?.category,
        items: [...(res?.items || []), item],
      };
      const StringfyData = JSON.stringify(newData);
      AsyncStorage.setItem(CATEGORY, StringfyData).then(() => {
        onSuccess();
      });
    } else {
      const data = JSON.stringify({category: cat, items: [item]});
      AsyncStorage.setItem(CATEGORY, data).then(() => {
        onSuccess();
      });
    }
  });
};

export const GetCategory = (onSuccess, onFailure) => {
  AsyncStorage.getItem(CATEGORY)
    .then(res => {
      if (res) {
        const parseData = JSON.parse(res);
        onSuccess(parseData);
      } else {
        onSuccess(null);
      }
    })
    .catch(error => {
      onFailure(error);
    });
};

export const USER = 'user';
export const FCM_TOKEN = 'fcmToken';
export const DEVICE_ID = 'deviceId';
export const MENU = 'menu';
export const CATEGORY = 'category';
export const RESTURANTS = 'resturants';
export const RESTURANT_MENU = 'resturant_menu';
export const CATEGORY_LIST = 'category_list';
