
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


  // Функция составления событий по данным
  function eventsCreate(data) {
    let eString = '';
    $(data).each(function(i, item) {
      eString += `
        <div class="datepicker--cell-event" event-id="${item.id}" data-img="${item.img}" ${(item.days) ? `data-days="${item.days}"` : ``} data-title="${item.name}" data-link="${item.link}"></div>`
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

          return {
            html: d +
              `<div class="datepicker--cell-content" data-date="${d} ${monthNames[m]}">${eventsCreate(eventsDate[y][m][d])}</div>`,
            classes: '-event-',
            disabled: false
          }
        }
      } catch (e) {

      }
    },
    onSelect(formattedDate, date, inst) {
      if (!date) return

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
        .append(`<span class="calendar__date" data-date="${d}" data-month="${m}">${selectedDate}</span>`)
        .append('<ul></ul>');

      $(links).each(function(i, item) {
        const element = `
          <li class="event" event-id="${$(item).attr('event-id')}" ${$(item).data('days') ? `data-days="${$(item).data('days')}"` : ``}>
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
        $('.calendar__month_active').datepicker().data('datepicker').clear();
    }
  })

  $(document).on('click', '.event a', function(e) {
    e.preventDefault();

    const eventTarget = $(this).parent(),
          days = $(eventTarget).data('days'),
          eventId = $(eventTarget).attr('event-id'),
          eventCell = $(`.calendar__month_active [event-id="${eventId}"]`);

    $('.event_selected').removeClass('event_selected');
    $('.datepicker--cell-content_selected').removeClass('datepicker--cell-content_selected');
    $('.datepicker--cell-event_active').removeClass('datepicker--cell-event_active');

    $(eventTarget).addClass('event_selected');
    $(eventCell).parent().addClass('datepicker--cell-content_selected');

    if (days != undefined) $(eventCell).addClass('datepicker--cell-event_active');

  });
