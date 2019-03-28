
  // Данные о событиях
  let eventsDate;

  $.ajax({
    type: 'GET',
    url: "data/events.json",
    async: false,
    beforeSend: function (xhr) {
      if (xhr && xhr.overrideMimeType) {
        xhr.overrideMimeType('application/json;charset=utf-8');
      }
    },
    dataType: 'json',
    success: function (data) {
      eventsDate = data;
    }
  });


  // Функция составления ссылок по данным из события
  function linksEvent(data) {
    var links = '';

    $(data).each(function(i, item) {
      // links += `<a href="${item.link}" ${ (item.longer) ? `data-longer="${item.longer}"` : '' } data-img="${item.img}">${item.name}</a>`
      links += `<a href="${item.link}" data-img="${item.img}">${item.name}</a>`
    })

    return links
  }

  function eventsCreate(data) {
    let eString = '';
    $(data).each(function(i, item) {
      eString += `<div class="datepicker--cell-event" ${ (item.id) ? `event-id="${item.id}"` : '' } data-img="${item.img}" data-title="${item.name}" data-link="${item.link}"></div>`
    })

    return eString
  }

  // Задаю начальную дату и переменную для новой даты
  var initDate = new Date(),
      newDate = initDate,
      monthNames = [
        "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
        "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"
      ];

  // Настройки календаря
  const optionsCalendar = {
    startDate: newDate,
    selectOtherMonths: !1,
    keyboardNav: !1,
    multipleDatesSeparator: '',
    navTitles: {
        days: 'MM yyyy',
        months: 'yyyy',
        years: 'yyyy1 - yyyy2'
    },
    onRenderCell(date, cellType) {
      const y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDate();

      try {
        if (eventsDate[y][m][d] != undefined) {

          const eventsCount = eventsDate[y][m][d].length;
          let longer = 1, n = 1;

          $(eventsDate[y][m][d]).each(function(i, event) {
            longer = (event.longer > longer) ? event.longer : longer
          })

          while (n < longer) {
            $(`.calendar__month_active [data-date="${d}"]`).next().addClass('longerrrrrr')
            console.log($(`.calendar__month_active [data-date="${d}"]`), d,m)
            n++;
          }

          return {
            // html: d +
            //   '<div class="datepicker--cell-content" data-date="'+d+' '+monthNames[m]+'">'+linksEvent(eventsDate[y][m][d])+'</div>',
            html: d +
              `<div class="datepicker--cell-content" data-date="${d} ${monthNames[m]}">${eventsCreate(eventsDate[y][m][d])}</div>`,
            // classes: ((eventsCount == 1) ? '-event-' : (eventsCount > 2) ? '-event- -event--alot-' : '-event- -event--two-'),
            classes: '-event-',
            disabled: false
          }
        }
      } catch (e) {

      }
    },
    onSelect(formattedDate, date, inst) {
      const m = inst.selectedDates[0].getMonth(),
            d = inst.selectedDates[0].getDate(),
            eventMessage = $('.calendar__events').get(0),
            selectedDay = $(inst.el).find(`[data-date="${d}"][data-month="${m}"]`),
            selectedContent = $(selectedDay).find('.datepicker--cell-content').get(0);

      let selectedDate, links;

      if (selectedContent) {
        selectedDate = $(selectedContent).data('date');
        links = $(selectedContent).children();
      } else {
        $(eventMessage).hide().empty();
        return false;
      }

      $(eventMessage)
        .empty()
        .css({
          'top': $(selectedDay).offset().top - $('.calendar').offset().top,
          'left': $(selectedDay).offset().left - $('.calendar').offset().left
        })
        .append(`<span class="calendar__date">${selectedDate}</span>`)
        .append('<ul></ul>');

      $(links).each(function(i, item) {
        const element = `
          <li class="event">
            <div class="event__img"><img src="${$(item).data('img')}" alt="${$(item).data('title')}"/></div>
            <a href="${$(item).data('link')}" target="_blank">${$(item).data('title')}</a>
          </li>
        `
        $(eventMessage).find('ul').append(element);
      })

      $(eventMessage).show();
    }
  };

  // Инициализация
  $('[data-calendar="init"]').datepicker(optionsCalendar)

  // Прошлое
  $('[data-calendar="init"]').prevAll().each(function(i, calendar) {
    var month = newDate.getMonth() - 1;

    newDate.setMonth(month);

    $(calendar).datepicker(optionsCalendar)
  })

  // Обновляем дату на начальную
  newDate = new Date();
  optionsCalendar.startDate = newDate;

  // Будущее
  $('[data-calendar="init"]').nextAll().each(function(i, calendar) {
    var month = newDate.getMonth() + 1;

    newDate.setMonth(month);

    $(calendar).datepicker(optionsCalendar)
  })

  $('.calendar__month_active').datepicker().data('datepicker').date = new Date();

  // Перелистывание календарей
  $('.calendar__btn').on('click', function() {
    const direction = $(this).data('direction');

    $('.calendar__month').each(function(i, calendar) {
      $('.datepicker--cell.-selected-').removeClass('-selected-');
      
      switch (direction) {
        case 0:
          $(calendar).datepicker().data('datepicker').prev();
          break;
        case 1:
          $(calendar).datepicker().data('datepicker').next();
          break;
        default:
          console.error('undefined direction')
          break;
        }
    });
  });

  $(document).on('click', function(e) {
    if (
      (!$(e.target).hasClass('-event-') || !Boolean($(e.target).closest('.-event-').get(0))) &&
      !Boolean($(e.target).closest('.calendar__events').get(0))) {

        $('.calendar__events').hide();
    }
  })
