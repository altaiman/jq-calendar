'use strict';

// Данные о событиях
var eventsDate = void 0;

$.ajax({
  type: 'GET',
  url: "data/events.json",
  async: false,
  beforeSend: function beforeSend(xhr) {
    if (xhr && xhr.overrideMimeType) {
      xhr.overrideMimeType('application/json;charset=utf-8');
    }
  },
  dataType: 'json',
  success: function success(data) {
    eventsDate = data;
  }
});

// Функция составления событий по данным
function eventsCreate(data) {
  var eString = '';
  $(data).each(function (i, item) {
    eString += '\n        <div class="datepicker--cell-event" event-id="' + item.id + '" data-img="' + item.img + '" ' + (item.days ? 'data-days="' + item.days + '"' : '') + ' data-title="' + item.name + '" data-link="' + item.link + '"></div>';
  });

  return eString;
}

// Задаю начальную дату и переменную для новой даты
var initDate = new Date(),
    newDate = initDate,
    monthNames = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];

// Настройки календаря
var optionsCalendar = {
  startDate: newDate,
  selectOtherMonths: !1,
  keyboardNav: !1,
  multipleDatesSeparator: '',
  navTitles: {
    days: 'MM yyyy',
    months: 'yyyy',
    years: 'yyyy1 - yyyy2'
  },

  // Функция обработки ячеек при создании календаря
  onRenderCell: function onRenderCell(date, cellType) {
    var y = date.getFullYear(),
        m = date.getMonth(),
        d = date.getDate();

    try {
      if (eventsDate[y][m][d] != undefined) {

        return {
          html: d + ('<div class="datepicker--cell-content" data-date="' + d + ' ' + monthNames[m] + '">' + eventsCreate(eventsDate[y][m][d]) + '</div>'),
          classes: '-event-',
          disabled: false
        };
      }
    } catch (e) {}
  },


  // Функция обработки событий при выборе дня
  onSelect: function onSelect(formattedDate, date, inst) {
    if (!date) return;

    var m = inst.selectedDates[0].getMonth(),
        d = inst.selectedDates[0].getDate(),
        eventMessage = $('.calendar__events').get(0),
        selectedDay = $(inst.el).find('[data-date="' + d + '"][data-month="' + m + '"]'),
        selectedContent = $(selectedDay).find('.datepicker--cell-content').get(0);

    var selectedDate = void 0,
        links = void 0;

    if (selectedContent) {
      selectedDate = $(selectedContent).data('date');
      links = $(selectedContent).children();
    } else {
      $(eventMessage).hide().empty();
      return false;
    }

    $(eventMessage).empty().css({
      'top': $(selectedDay).offset().top - $('.calendar').offset().top,
      'left': $(selectedDay).offset().left - $('.calendar').offset().left
    }).append('<span class="calendar__date" data-date="' + d + '" data-month="' + m + '">' + selectedDate + '</span>').append('<ul></ul>');

    $(links).each(function (i, item) {
      var element = '\n          <li class="event" event-id="' + $(item).attr('event-id') + '" ' + ($(item).data('days') ? 'data-days="' + $(item).data('days') + '"' : '') + '>\n            <div class="event__img"><img src="' + $(item).data('img') + '" alt="' + $(item).data('title') + '"/></div>\n            <a href="' + $(item).data('link') + '" target="_blank">' + $(item).data('title') + '</a>\n          </li>\n        ';
      $(eventMessage).find('ul').append(element);
    });

    $(eventMessage).show();
  }
};

// Инициализация
$('[data-calendar="init"]').datepicker(optionsCalendar);

// Прошлое
$('[data-calendar="init"]').prevAll().each(function (i, calendar) {
  var month = newDate.getMonth() - 1;

  newDate.setMonth(month);

  $(calendar).datepicker(optionsCalendar);
});

// Обновляем дату на начальную
newDate = new Date();
optionsCalendar.startDate = newDate;

// Будущее
$('[data-calendar="init"]').nextAll().each(function (i, calendar) {
  var month = newDate.getMonth() + 1;

  newDate.setMonth(month);

  $(calendar).datepicker(optionsCalendar);
});

$('.calendar__month_active').datepicker().data('datepicker').date = new Date();

// Перелистывание календарей
$('.calendar__btn').on('click', function () {
  var direction = $(this).data('direction');

  $('.calendar__month').each(function (i, calendar) {
    $('.datepicker--cell.-selected-').removeClass('-selected-');

    switch (direction) {
      case 0:
        $(calendar).datepicker().data('datepicker').prev();
        break;
      case 1:
        $(calendar).datepicker().data('datepicker').next();
        break;
      default:
        console.error('undefined direction');
        break;
    }
  });
});

$(document).on('click', function (e) {
  if ((!$(e.target).hasClass('-event-') || !Boolean($(e.target).closest('.-event-').get(0))) && !Boolean($(e.target).closest('.calendar__events').get(0))) {

    $('.calendar__events').hide();
    $('.calendar__month_active').datepicker().data('datepicker').clear();
  }
});

$(document).on('click', '.event a', function (e) {
  e.preventDefault();

  var eventTarget = $(this).parent(),
      days = $(eventTarget).data('days'),
      eventId = $(eventTarget).attr('event-id'),
      eventContent = $('.calendar__month_active [event-id="' + eventId + '"]'),
      eventCell = $(eventContent).closest('.datepicker--cell'),
      eventWeekend = $(eventCell).hasClass('-weekend-');

  $('.datepicker--cell-event--duration').remove();

  if (days > 1) {
    var widthCell = $(eventContent).width();

    $(eventCell).find('.datepicker--cell-content').append('<span class="datepicker--cell-event--duration" data-duration="0"></span>');

    $(eventCell).nextAll().each(function (i, cell) {
      if (i === days - 1) return false;

      var eventDutaion = '<span class="datepicker--cell-event--duration" data-duration="' + (i + 1) + '"></span>';

      if ($(cell).find('.datepicker--cell-content').get(0)) {
        $(cell).find('.datepicker--cell-content').append(eventDutaion);
      } else {
        $(cell).append(eventDutaion);
      }
    });

    $('[data-duration]').last().attr('data-duration', 'end');
  }

  $('.event_selected').removeClass('event_selected');
  $('.datepicker--cell-content_select').removeClass('datepicker--cell-content_selected');
  $('.datepicker--cell-event_active').removeClass('datepicker--cell-event_active');

  $(eventTarget).addClass('event_selected');
  $(eventContent).parent().addClass('datepicker--cell-content_selected');

  if (days != undefined) $(eventContent).addClass('datepicker--cell-event_active');
});
